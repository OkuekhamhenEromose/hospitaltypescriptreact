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
import datetime

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

def _ensure_single_image_in_s3(image_field, instance, field_name):
    """Background task to create placeholder if image doesn't exist"""
    try:
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        s3_key = f"media/{image_field.name}"
        
        # Check if file exists
        try:
            s3.head_object(Bucket=bucket_name, Key=s3_key)
            logger.info(f"✅ Image exists: {image_field.name}")
            return True
        except:
            logger.info(f"⚠️ Creating placeholder for: {image_field.name}")
            
            # Create placeholder image
            if field_name == 'featured_image':
                width, height = 800, 400
            else:
                width, height = 600, 400
            
            # Create unique placeholder
            unique_id = f"blog_{instance.id}_{field_name}"
            image_data, content_type = create_s3_placeholder_image(
                unique_id, width, height
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
                    'placeholder': 'true'
                }
            )
            
            logger.info(f"✅ Created placeholder: {image_field.name}")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error ensuring image {image_field.name}: {e}")
        return False

# hospital/models.py - UPDATE the signal handler section

# Replace the _upload_image_to_s3 function with this:

def _upload_actual_image_to_s3(image_field, instance, field_name):
    """Upload the actual image file to S3"""
    try:
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        s3_key = f"media/{image_field.name}"
        
        # First check if it's already uploaded (not a placeholder)
        try:
            existing = s3.head_object(Bucket=bucket_name, Key=s3_key)
            metadata = existing.get('Metadata', {})
            
            # If it's already an actual image (not placeholder), skip
            if metadata.get('actual_image') == 'true' or metadata.get('placeholder') != 'true':
                logger.info(f"✅ Actual image already exists: {image_field.name}")
                return True
        except:
            pass  # File doesn't exist, proceed with upload
        
        # Check if image_field has actual file data
        if hasattr(image_field, 'file') and image_field.file:
            logger.info(f"📤 Uploading actual image: {image_field.name}")
            
            # Read the file
            image_field.open('rb')
            image_data = image_field.read()
            image_field.close()
            
            # Determine content type
            filename = image_field.name.lower()
            if filename.endswith('.webp'):
                content_type = 'image/webp'
            elif filename.endswith('.png'):
                content_type = 'image/png'
            elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
                content_type = 'image/jpeg'
            else:
                content_type = 'application/octet-stream'
            
            # Upload actual image
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
                    'actual_image': 'true',
                    'uploaded_at': datetime.now().isoformat()
                }
            )
            
            logger.info(f"✅ Uploaded actual image: {image_field.name} ({len(image_data)} bytes)")
            return True
        else:
            logger.warning(f"⚠️ No file data for {image_field.name}, creating placeholder")
            # Fall back to placeholder if no actual file
            return _ensure_single_image_in_s3(image_field, instance, field_name)
            
    except Exception as e:
        logger.error(f"❌ Error uploading actual image {image_field.name}: {e}")
        return False

@receiver(post_save, sender=BlogPost)
def ensure_blog_images_exist_in_s3(sender, instance, created, **kwargs):
    """
    Automatically upload missing blog images to S3
    Runs after save to avoid conflicts
    """
    # Skip if running in test mode or migrations
    if kwargs.get('raw', False):
        return
    
    try:
        # Log the images we have
        logger.info(f"Checking images for blog {instance.id} - {instance.title}")
        
        # Check each image field
        image_fields = {
            'featured_image': instance.featured_image,
            'image_1': instance.image_1,
            'image_2': instance.image_2
        }
        
        for field_name, image_field in image_fields.items():
            if image_field and image_field.name:
                logger.info(f"  Found {field_name}: {image_field.name}")
                
                # Check if the image has a file associated
                if hasattr(image_field, 'file') and image_field.file:
                    logger.info(f"  Image has file: {image_field.name}")
                    # Schedule background task to upload image to S3
                    threading.Thread(
                        target=_upload_actual_image_to_s3,
                        args=(image_field, instance, field_name),
                        daemon=True
                    ).start()
                else:
                    logger.info(f"  Image doesn't have file data: {image_field.name}")
                    # Fall back to placeholder
                    threading.Thread(
                        target=_ensure_single_image_in_s3,
                        args=(image_field, instance, field_name),
                        daemon=True
                    ).start()
                
    except Exception as e:
        logger.error(f"ERROR in image check for blog {instance.id}: {e}")


# Add this robust upload function to your models.py

def upload_blog_image_to_s3(image_field, blog_post, field_name):
    """Robust function to upload blog images to S3"""
    import boto3
    from django.conf import settings
    import logging
    from PIL import Image
    import io
    
    logger = logging.getLogger(__name__)
    
    if not image_field or not image_field.name:
        logger.warning(f"No image field for {field_name}")
        return False
    
    try:
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        filename = image_field.name.split('/')[-1]
        s3_key = f"media/{image_field.name}"
        
        # Check if already exists
        try:
            existing = s3.head_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=s3_key
            )
            metadata = existing.get('Metadata', {})
            
            # If it's an actual image (not placeholder), don't overwrite
            if metadata.get('placeholder') != 'true':
                logger.info(f"✅ Image already uploaded: {filename}")
                return True
        except:
            pass  # File doesn't exist, continue with upload
        
        # Try to upload actual file
        try:
            if hasattr(image_field, 'file') and image_field.file:
                image_field.open('rb')
                image_data = image_field.read()
                image_field.close()
                
                # Determine content type
                if filename.lower().endswith('.png'):
                    content_type = 'image/png'
                elif filename.lower().endswith('.webp'):
                    content_type = 'image/webp'
                elif filename.lower().endswith('.jpg') or filename.lower().endswith('.jpeg'):
                    content_type = 'image/jpeg'
                else:
                    content_type = 'application/octet-stream'
                
                # Upload to S3
                s3.put_object(
                    Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                    Key=s3_key,
                    Body=image_data,
                    ContentType=content_type,
                    ACL='public-read',
                    Metadata={
                        'blog_id': str(blog_post.id),
                        'blog_title': blog_post.title[:100],
                        'field': field_name,
                        'actual_image': 'true',
                        'uploaded_at': 'auto'
                    }
                )
                
                logger.info(f"✅ Uploaded actual image: {filename} ({len(image_data)} bytes)")
                return True
                
        except Exception as upload_error:
            logger.warning(f"⚠️ Could not upload actual image {filename}: {upload_error}")
        
        # Fallback: Create placeholder
        logger.info(f"🔄 Creating placeholder for {filename}")
        
        # Create colored placeholder
        colors = {
            'featured_image': (73, 109, 137),  # Blue
            'image_1': (109, 137, 73),         # Green
            'image_2': (137, 73, 109),         # Purple
        }
        color = colors.get(field_name, (100, 100, 100))
        
        img = Image.new('RGB', (800, 600), color=color)
        
        # Save to bytes
        buffer = io.BytesIO()
        if filename.lower().endswith('.png'):
            img.save(buffer, format='PNG')
            content_type = 'image/png'
        elif filename.lower().endswith('.webp'):
            img.save(buffer, format='WEBP')
            content_type = 'image/webp'
        else:
            img.save(buffer, format='JPEG')
            content_type = 'image/jpeg'
        
        buffer.seek(0)
        
        # Upload placeholder
        s3.put_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=s3_key,
            Body=buffer.getvalue(),
            ContentType=content_type,
            ACL='public-read',
            Metadata={
                'blog_id': str(blog_post.id),
                'blog_title': blog_post.title[:100],
                'field': field_name,
                'placeholder': 'true',
                'auto_created': 'yes'
            }
        )
        
        logger.info(f"✅ Created placeholder: {filename}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to upload image {filename}: {e}")
        return False