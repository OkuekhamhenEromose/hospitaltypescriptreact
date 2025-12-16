# test_s3_upload.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from io import BytesIO
from PIL import Image
import tempfile

print("🧪 Testing S3 Upload...")

# Create a test image
img = Image.new('RGB', (100, 100), color='blue')

# Save to BytesIO
img_bytes = BytesIO()
img.save(img_bytes, format='JPEG')
img_bytes.seek(0)

# Create a ContentFile
test_file = ContentFile(img_bytes.read(), name='test_upload.jpg')

try:
    # Upload to S3
    saved_path = default_storage.save('test_upload/test_image.jpg', test_file)
    print(f"✅ Uploaded to: {saved_path}")
    
    # Get URL
    url = default_storage.url(saved_path)
    print(f"✅ URL: {url}")
    
    # Check if file exists
    exists = default_storage.exists(saved_path)
    print(f"✅ File exists in S3: {exists}")
    
    # Delete test file
    default_storage.delete(saved_path)
    print("✅ Test file deleted")
    
except Exception as e:
    print(f"❌ Upload failed: {e}")
    import traceback
    traceback.print_exc()