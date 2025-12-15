# check_storage.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.conf import settings

print("=" * 70)
print("STORAGE CONFIGURATION CHECK")
print("=" * 70)

# Check AWS credentials
print("\n🔑 AWS CREDENTIALS:")
print(f"AWS_ACCESS_KEY_ID: {'✓ SET' if settings.AWS_ACCESS_KEY_ID else '✗ MISSING'}")
print(f"AWS_SECRET_ACCESS_KEY: {'✓ SET' if settings.AWS_SECRET_ACCESS_KEY else '✗ MISSING'}")
print(f"AWS_STORAGE_BUCKET_NAME: {settings.AWS_STORAGE_BUCKET_NAME}")
print(f"AWS_S3_REGION_NAME: {settings.AWS_S3_REGION_NAME}")
print(f"AWS_S3_CUSTOM_DOMAIN: {getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', 'Not set')}")

# Check storage settings
print("\n💾 STORAGE SETTINGS:")
print(f"DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
print(f"MEDIA_URL: {settings.MEDIA_URL}")

# Check if using S3
if hasattr(settings, 'DEFAULT_FILE_STORAGE'):
    if 's3' in settings.DEFAULT_FILE_STORAGE.lower():
        print("✅ USING S3 STORAGE")
    else:
        print("⚠️  USING LOCAL FILESYSTEM STORAGE")

# Test actual storage
print("\n🧪 TESTING ACTUAL STORAGE:")
from django.core.files.storage import default_storage
print(f"Default storage class: {default_storage.__class__.__name__}")

if hasattr(default_storage, 'bucket_name'):
    print(f"✅ S3 Storage Active - Bucket: {default_storage.bucket_name}")
else:
    print(f"⚠️  Local Filesystem Storage Active")

print("=" * 70)