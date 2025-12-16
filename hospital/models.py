# hospital/models.py - COMPLETE UPDATED VERSION
from django.db import models
from django.utils import timezone
from users.models import Profile
import random
import json
from django.utils.text import slugify
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
import boto3
from PIL import Image
import io
import hashlib
import threading
import logging

logger = logging.getLogger(__name__)

SEX_CHOICES = (('M', 'Male'), ('F', 'Female'), ('O', 'Other'))

APPOINTMENT_STATUS = (
    ('PENDING', 'Pending'),
    ('IN_REVIEW', 'In Review'),
    ('AWAITING_RESULTS', 'Awaiting Results'),
    ('COMPLETED', 'Completed'),
    ('CANCELLED', 'Cancelled'),
)

REQUEST_STATUS = (
    ('PENDING', 'Pending'),
    ('IN_PROGRESS', 'In Progress'),
    ('DONE', 'Done'),
    ('CANCELLED', 'Cancelled'),
)

# ==================== HELPER FUNCTIONS FOR AUTO-IMAGE CREATION ====================

def create_s3_placeholder_image(text, width=800, height=400, img_format='JPEG'):
    """
    Create a colored placeholder image for S3
    """
    # Generate consistent color from text
    color_hash = hashlib.md5(text.encode()).hexdigest()[:6]
    img = Image.new('RGB', (width, height), color=f'#{color_hash}')
    
    buffer = io.BytesIO()
    
    if img_format.upper() == 'WEBP':
        img.save(buffer, format='WEBP', quality=85)
        content_type = 'image/webp'
    elif img_format.upper() == 'PNG':
        img.save(buffer, format='PNG')
        content_type = 'image/png'
    else:
        img.save(buffer, format='JPEG', quality=85)
        content_type = 'image/jpeg'
    
    buffer.seek(0)
    return buffer.getvalue(), content_type

def ensure_image_in_s3(image_field, instance, field_name):
    """
    Check if image exists in S3, create placeholder if missing
    Runs in background thread
    """
    if not image_field or not image_field.name:
        return
    
    try:
        # Setup S3 client
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        
        s3_key = f"media/{image_field.name}"
        
        # Check if file exists in S3
        try:
            s3.head_object(Bucket=bucket_name, Key=s3_key)
            logger.info(f"✅ Image already exists in S3: {image_field.name}")
            return
        except:
            logger.info(f"⚠️  Creating placeholder for missing image: {image_field.name}")
            
            # Determine image size based on field
            if field_name == 'featured_image':
                width, height = 800, 400
            else:  # image_1 or image_2
                width, height = 400, 300
            
            # Determine format from filename
            filename = image_field.name
            if filename.lower().endswith('.webp'):
                img_format = 'WEBP'
            elif filename.lower().endswith('.png'):
                img_format = 'PNG'
            else:
                img_format = 'JPEG'
            
            # Create unique identifier for color
            unique_id = f"blog_{instance.id}_{field_name}_{instance.title[:50]}"
            image_data, content_type = create_s3_placeholder_image(
                unique_id, width, height, img_format
            )
            
            # Upload to S3
            s3.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=image_data,
                ContentType=content_type,
                ACL='public-read',
                Metadata={
                    'blog_id': str(instance.id),
                    'blog_title': instance.title[:100],
                    'field': field_name,
                    'placeholder': 'true',
                    'auto_created': 'yes'
                }
            )
            
            logger.info(f"✅ Created placeholder in S3: {image_field.name} ({len(image_data)} bytes)")
            
    except Exception as e:
        logger.error(f"❌ Error ensuring image {image_field.name}: {e}")

# ==================== MAIN MODELS ====================

class Appointment(models.Model):
    patient = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='appointments')
    name = models.CharField(max_length=255)
    age = models.PositiveSmallIntegerField()
    sex = models.CharField(max_length=2, choices=SEX_CHOICES)
    address = models.TextField()
    booked_at = models.DateTimeField(auto_now_add=True)
    doctor = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_appointments')
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=APPOINTMENT_STATUS, default='PENDING')

    def __str__(self):
        return f"Appointment {self.id} - {self.name}"

    def assign_doctor(self):
        """Automatically assign an available doctor to this appointment"""
        if self.doctor:
            return  # Already assigned
            
        # Get all available doctors
        available_doctors = Profile.objects.filter(role='DOCTOR', user__is_active=True)
        
        if available_doctors.exists():
            # Assign a random doctor (you can modify this logic for load balancing)
            assigned_doctor = random.choice(list(available_doctors))
            self.doctor = assigned_doctor
            self.save()
            print(f"Assigned doctor {assigned_doctor.fullname} to appointment {self.id}")

    def save(self, *args, **kwargs):
        # Call assign_doctor after saving if no doctor is assigned
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and not self.doctor:
            self.assign_doctor()

class Assignment(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='assignments')
    staff = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='assignments')
    role = models.CharField(max_length=20, choices=[('DOCTOR', 'Doctor'), ('NURSE', 'Nurse'), ('LAB', 'Lab Scientist')])
    assigned_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_staff')
    assigned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['appointment', 'staff', 'role']
          
class TestRequest(models.Model):
    """Created by doctor, assigned to a lab scientist (or left unassigned)."""
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='test_requests')
    requested_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='test_requests_made')  # doctor
    assigned_to = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='test_requests_assigned')  # lab scientist
    tests = models.TextField(help_text="Comma-separated test list or JSON")  # e.g. "glucose,blood count,urinalysis"
    note = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def assign_lab_scientist(self):
        """Automatically assign an available lab scientist to this test request"""
        if self.assigned_to:
            return  # Already assigned
            
        # Get all available lab scientists
        available_lab_scientists = Profile.objects.filter(role='LAB', user__is_active=True)
        
        if available_lab_scientists.exists():
            # Assign a random lab scientist
            assigned_scientist = random.choice(list(available_lab_scientists))
            self.assigned_to = assigned_scientist
            self.save()
            print(f"Assigned lab scientist {assigned_scientist.fullname} to test request {self.id}")

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and not self.assigned_to:
            self.assign_lab_scientist()

         # Update appointment status when test request is completed
        if not is_new and self.status == 'DONE':
            # Check if we have both vitals and test results
            appointment = self.appointment
            has_vitals = appointment.vital_requests.filter(status='DONE').exists()
            has_all_tests = appointment.test_requests.filter(status='PENDING').exists()
            
            if has_vitals and not has_all_tests:
                # Both vitals and tests are done, ready for doctor review
                appointment.status = 'IN_REVIEW'
                appointment.save()


class VitalRequest(models.Model):
    """Created by doctor, assigned to a nurse (or left unassigned)."""
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='vital_requests')
    requested_by = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='vital_requests_made')  # doctor
    assigned_to = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='vital_requests_assigned')  # nurse
    note = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def assign_nurse(self):
        """Automatically assign an available nurse to this vital request"""
        if self.assigned_to:
            return  # Already assigned
            
        # Get all available nurses
        available_nurses = Profile.objects.filter(role='NURSE', user__is_active=True)
        
        if available_nurses.exists():
            # Assign a random nurse
            assigned_nurse = random.choice(list(available_nurses))
            self.assigned_to = assigned_nurse
            self.save()
            print(f"Assigned nurse {assigned_nurse.fullname} to vital request {self.id}")

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and not self.assigned_to:
            self.assign_nurse()

         # Update appointment status when vital request is completed
        if not is_new and self.status == 'DONE':
            appointment = self.appointment
            # If tests are also done, mark as in review
            pending_tests = appointment.test_requests.filter(status='PENDING').exists()
            if not pending_tests:
                appointment.status = 'IN_REVIEW'
                appointment.save()

class Vitals(models.Model):
    vital_request = models.ForeignKey(
        VitalRequest,
        on_delete=models.CASCADE,
        related_name='vitals_entries',
        null=True,  # allow null for existing rows
        blank=True
    )
    nurse = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='vitals_recorded')
    blood_pressure = models.CharField(max_length=50, blank=True, null=True)
    respiration_rate = models.PositiveSmallIntegerField(null=True, blank=True)
    pulse_rate = models.PositiveSmallIntegerField(null=True, blank=True)
    body_temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

class LabResult(models.Model):
    # Link lab result to a TestRequest
    test_request = models.ForeignKey(TestRequest, on_delete=models.CASCADE, related_name='lab_results', null=True, blank=True)
    lab_scientist = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='lab_results_posted')
    test_name = models.CharField(max_length=255)  # e.g. "glucose"
    result = models.TextField(blank=True, null=True)
    units = models.CharField(max_length=50, blank=True, null=True)
    reference_range = models.CharField(max_length=100, blank=True, null=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

class MedicalReport(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='medical_report')
    doctor = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    medical_condition = models.TextField()
    drug_prescription = models.TextField(blank=True, null=True)
    advice = models.TextField(blank=True, null=True)
    next_appointment = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # mark appointment completed when report is created
        appt = self.appointment
        appt.status = 'COMPLETED'
        appt.save()

# ==================== BLOG POST MODEL WITH AUTO-IMAGE FIX ====================

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    content = models.TextField()
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='blog_posts')

    featured_image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    image_1 = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    image_2 = models.ImageField(upload_to='blog_images/', null=True, blank=True)

    published = models.BooleanField(default=False)
    published_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    slug = models.SlugField(max_length=200, unique=True, blank=True)

    # Table of Contents + auto extracted subheadings
    table_of_contents = models.JSONField(default=list, blank=True)
    enable_toc = models.BooleanField(default=True)
    subheadings = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-published_date', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Set published date
        if self.published and not self.published_date:
            self.published_date = timezone.now()

        # Auto slug
        if not self.slug:
            self.slug = slugify(self.title)

        # Generate TOC + subheadings
        if self.content:
            if self.enable_toc:
                self.generate_table_of_contents()
            self.extract_subheadings()

        super().save(*args, **kwargs)

    # ------------------------------
    # TABLE OF CONTENTS GENERATOR
    # ------------------------------
    def generate_table_of_contents(self):
        import re

        pattern = r'<h([1-6])[^>]*>(.*?)</h\1>'
        headings = re.findall(pattern, self.content)

        toc_items = []
        for level, html_title in headings:
            clean_title = re.sub(r'<[^>]+>', '', html_title).strip()
            anchor = slugify(clean_title)
            toc_items.append({
                "id": len(toc_items) + 1,
                "title": clean_title,
                "anchor": anchor,
                "level": int(level)
            })

        self.table_of_contents = toc_items

    # ------------------------------
    # SUBHEADINGS EXTRACTOR
    # ------------------------------
    def extract_subheadings(self):
        import re

        pattern = r'<h([1-6])[^>]*>(.*?)</h\1>(.*?)(?=<h[1-6]|$)'
        matches = re.findall(pattern, self.content or "", re.DOTALL)

        structured = []

        if matches:
            for level, html_title, section_body in matches:
                clean_title = re.sub(r'<[^>]+>', '', html_title).strip()
                clean_desc = re.sub(r'<[^>]+>', '', section_body).strip()

                structured.append({
                    "title": clean_title,
                    "level": int(level),
                    "description": clean_desc[:200] + ("..." if len(clean_desc) > 200 else ""),
                    "full_content": section_body.strip()
                })
        else:
            # fallback using description
            if self.description:
                lines = self.description.split(". ")[:2]
                for i, line in enumerate(lines):
                    structured.append({
                        "title": f"Section {i+1}",
                        "level": 2,
                        "description": line[:200] + ("..." if len(line) > 200 else ""),
                        "full_content": line
                    })

        self.subheadings = structured[:6]

# ==================== SIGNAL HANDLER FOR AUTO-IMAGE CREATION ====================

@receiver(post_save, sender=BlogPost)
def ensure_blog_images_exist_in_s3(sender, instance, created, **kwargs):
    """
    Automatically create missing blog images in S3
    Runs in background thread to avoid slowing down requests
    """
    def background_image_check():
        try:
            # Check each image field
            for field_name in ['featured_image', 'image_1', 'image_2']:
                image_field = getattr(instance, field_name)
                if image_field and image_field.name:
                    ensure_image_in_s3(image_field, instance, field_name)
                    
        except Exception as e:
            logger.error(f"❌ Error in background image check for blog {instance.id}: {e}")
    
    # Run in background thread (non-blocking)
    thread = threading.Thread(target=background_image_check)
    thread.daemon = True
    thread.start()
    logger.info(f"✅ Started background image check for blog: {instance.title}")