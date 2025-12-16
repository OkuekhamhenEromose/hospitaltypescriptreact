#!/usr/bin/env python
import os
import sys
import django
from io import BytesIO
from PIL import Image

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

try:
    django.setup()
    print("✅ Django setup successful")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

from django.core.files.uploadedfile import SimpleUploadedFile
from hospital.models import BlogPost
from users.models import Profile

def test_image_upload():
    print("🧪 Testing Image Upload to Blog Post...")
    
    # Get admin user
    try:
        admin = Profile.objects.filter(role='ADMIN').first()
        if not admin:
            print("❌ No admin user found")
            return
        print(f"✅ Admin user: {admin.fullname}")
    except Exception as e:
        print(f"❌ Error getting admin: {e}")
        return
    
    # Create a simple test image
    try:
        print("📸 Creating test image...")
        img = Image.new('RGB', (100, 100), color='red')
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        test_image = SimpleUploadedFile(
            name='test_image.jpg',
            content=img_byte_arr.read(),
            content_type='image/jpeg'
        )
        print(f"✅ Test image created: {test_image.name} ({test_image.size} bytes)")
    except Exception as e:
        print(f"❌ Error creating test image: {e}")
        # Try without PIL
        print("🔄 Trying alternative method...")
        test_image = SimpleUploadedFile(
            name='test.txt',
            content=b'Test content',
            content_type='text/plain'
        )
    
    # Try to create blog post with image
    try:
        print("\n📝 Creating blog post with image...")
        post = BlogPost.objects.create(
            title="Test Post With Image",
            description="Testing image upload functionality",
            content="<h1>Image Test</h1><p>Testing if images upload correctly</p><h2>Section 1</h2><p>More content</p>",
            author=admin,
            published=False,
            featured_image=test_image
        )
        
        print(f"✅ Blog post created! ID: {post.id}")
        print(f"📝 Title: {post.title}")
        print(f"📸 Featured image: {post.featured_image}")
        print(f"📸 Image name: {post.featured_image.name if post.featured_image else 'None'}")
        
        if post.featured_image:
            try:
                print(f"📸 Image URL: {post.featured_image.url}")
                
                # Check if file exists in storage
                import time
                print("⏳ Waiting for S3 upload...")
                time.sleep(3)  # Wait for async upload
                
                if hasattr(post.featured_image, 'storage') and post.featured_image.storage.exists(post.featured_image.name):
                    print("✅ Image successfully uploaded to S3!")
                else:
                    print("⚠️  Image may not be in S3 yet (could be async)")
                    
            except Exception as e:
                print(f"⚠️  Could not get image URL: {e}")
        
    except Exception as e:
        print(f"❌ Error creating blog post: {e}")
        import traceback
        traceback.print_exc()
        
        # Try without image first
        print("\n🔄 Trying without image...")
        try:
            post_no_image = BlogPost.objects.create(
                title="Test Post No Image",
                description="Testing without image",
                content="<h1>No Image Test</h1><p>Testing</p>",
                author=admin,
                published=False
            )
            print(f"✅ Created without image: {post_no_image.id}")
        except Exception as e2:
            print(f"❌ Also failed without image: {e2}")

if __name__ == '__main__':
    test_image_upload()