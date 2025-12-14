# users/serializers.py - COMPLETE FIXED VERSION
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, GENDER_CHOICES, ROLE_CHOICES
from django.contrib.auth.password_validation import validate_password
from .utils import SendMail
import logging

logger = logging.getLogger(__name__)

# ============================================
# UTILITY FUNCTION FOR ABSOLUTE IMAGE URL
# ============================================
def get_absolute_profile_image_url(profile_pix):
    """Get absolute URL for profile image, handling both S3 and local storage"""
    if not profile_pix:
        return None
    
    try:
        # For S3 storage - check if storage has bucket_name attribute
        if hasattr(profile_pix.storage, 'bucket_name'):
            return profile_pix.url
        
        # For local storage
        from django.conf import settings
        base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
        
        # Check if name is already a URL
        if profile_pix.name.startswith('http'):
            return profile_pix.name
        # Check if name starts with slash
        elif profile_pix.name.startswith('/'):
            return f"{base_url}{profile_pix.name}"
        else:
            # Default: assume it's in media directory
            return f"{base_url}/media/{profile_pix.name}"
    except Exception as e:
        logger.error(f"Error getting absolute URL for profile image: {e}")
        return None

# ============================================
# USER SERIALIZER
# ============================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# ============================================
# PROFILE SERIALIZER (FIXED!)
# ============================================
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_pix = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['user', 'fullname', 'phone', 'gender', 'profile_pix', 'role']

    def get_profile_pix(self, obj):
        """Use the utility function to get absolute URL"""
        return get_absolute_profile_image_url(obj.profile_pix)

# ============================================
# REGISTRATION SERIALIZER (FIXED!)
# ============================================
class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    fullname = serializers.CharField()
    phone = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.ChoiceField(
        choices=GENDER_CHOICES,
        required=False
    )
    role = serializers.ChoiceField(
        choices=ROLE_CHOICES,
        default='PATIENT'
    )
    profile_pix = serializers.ImageField(required=False, allow_null=True)

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        
        validate_password(data['password1'])
        
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username already taken.")
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already registered.")
        
        return data

    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password1')
        validated_data.pop('password2', None)
        profile_pix = validated_data.pop('profile_pix', None)

        # Create the user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Get or create profile
        profile, created = Profile.objects.get_or_create(user=user)
        
        # Update profile fields
        profile.fullname = validated_data.get('fullname', '')
        profile.phone = validated_data.get('phone', '')
        profile.gender = validated_data.get('gender', None)
        profile.role = validated_data.get('role', 'PATIENT')

        if profile_pix:
            # Generate a clean filename
            import os
            from django.utils.text import slugify
            
            # Get file extension
            ext = os.path.splitext(profile_pix.name)[1]
            # Create a clean filename
            clean_username = slugify(username)
            filename = f"{clean_username}_profile{ext}"
            
            # Save the image
            profile.profile_pix.save(filename, profile_pix, save=True)
            logger.info(f"Profile image saved for {username}: {filename}")
        else:
            profile.save()
            logger.info(f"Profile created without image for {username}")

        # Send welcome email (non-blocking)
        try:
            import threading
            def send_email_async():
                try:
                    from .utils import SendMail
                    SendMail(email)
                except Exception as e:
                    logger.warning(f"Failed to send email to {email}: {e}")
            
            email_thread = threading.Thread(target=send_email_async)
            email_thread.daemon = True
            email_thread.start()
            
            logger.info(f"User {username} registered successfully")
            
        except Exception as e:
            logger.warning(f"Failed to schedule email for {email}: {str(e)}")

        return profile

# ============================================
# UPDATE PROFILE SERIALIZER
# ============================================
class UpdateProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'fullname', 'phone', 'gender', 'profile_pix', 'role']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        if 'username' in user_data:
            user.username = user_data['username']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()

        for attr in ('fullname', 'phone', 'gender', 'profile_pix', 'role'):
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
        
        instance.save()
        return instance