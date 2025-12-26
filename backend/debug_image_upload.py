#!/usr/bin/env python
import os
import sys
import django
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

print("🔍 Debugging Image Upload...")

from hospital.models import BlogPost
from users.models import Profile

# Get admin
admin = Profile.objects.filter(role='ADMIN').first()
print(f"Admin: {admin}")

# Create test image
img = Image.new('RGB', (100, 100), color='blue')
img_byte_arr = BytesIO()
img.save(img_byte_arr, format='JPEG')
img_byte_arr.seek(0)

test_image = SimpleUploadedFile(
    name='debug_test.jpg',
    content=img_byte_arr.read(),
    content_type='image/jpeg'
)

print(f"Test image created: {test_image.name} ({test_image.size} bytes)")

# Try to create blog post
try:
    post = BlogPost(
        title="Debug Test",
        description="Debugging",
        content="<h1>Debug</h1>",
        author=admin,
        published=False
    )
    
    # Manually set the image
    post.featured_image = test_image
    
    # Save
    post.save()
    
    print(f"✅ Success! Post ID: {post.id}")
    print(f"   Image name: {post.featured_image.name}")
    print(f"   Image URL: {post.featured_image.url if post.featured_image else 'None'}")
    
    # Check if file was uploaded to S3
    import time
    time.sleep(2)  # Wait for upload
    
    if post.featured_image and post.featured_image.storage.exists(post.featured_image.name):
        print(f"   ✅ Image uploaded to S3!")
    else:
        print(f"   ⚠️  Image may not be in S3 yet")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()