# test_storage.py - Run this to test storage
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.conf import settings
from django.core.files.storage import default_storage

print("=" * 60)
print("STORAGE DEBUG TEST")
print("=" * 60)

print(f"1. Default storage class: {default_storage.__class__.__name__}")
print(f"2. Storage module: {default_storage.__module__}")

# Check if it's S3 storage
if hasattr(default_storage, 'bucket_name'):
    print(f"3. S3 Bucket: {default_storage.bucket_name}")
    print(f"4. S3 Region: {getattr(default_storage, 'region_name', 'Not set')}")
    print(f"5. Custom Domain: {getattr(default_storage, 'custom_domain', 'Not set')}")
    
    # Test URL generation
    test_path = 'test/test_image.jpg'
    try:
        url = default_storage.url(test_path)
        print(f"6. Test URL for '{test_path}': {url}")
    except Exception as e:
        print(f"6. Error generating URL: {e}")
else:
    print("3. Not using S3 storage (using local filesystem)")

print(f"7. MEDIA_URL from settings: {settings.MEDIA_URL}")
print(f"8. AWS_S3_CUSTOM_DOMAIN: {getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', 'Not set')}")

# Test with actual profile
try:
    from users.models import Profile
    profile = Profile.objects.filter(profile_pix__isnull=False).first()
    if profile and profile.profile_pix:
        print(f"\n9. Testing actual profile image:")
        print(f"   Username: {profile.user.username}")
        print(f"   Image name: {profile.profile_pix.name}")
        print(f"   Storage class: {profile.profile_pix.storage.__class__.__name__}")
        print(f"   URL from .url: {profile.profile_pix.url}")
except Exception as e:
    print(f"\n9. Error testing profile: {e}")

print("=" * 60)