// check_s3_file.py
// import boto3
// from botocore.exceptions import ClientError
// import os
// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// import django
// django.setup()

// from django.conf import settings

// print("🔍 Checking S3 files...")

// # Initialize S3 client
// s3 = boto3.client(
//     's3',
//     aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
//     aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
//     region_name=settings.AWS_S3_REGION_NAME
// )

// bucket = settings.AWS_STORAGE_BUCKET_NAME

// # Test files
// test_files = [
//     'profile/jameslebron_profile.jpg',
//     'profile/debronjames_profile.jpg',
//     'profile/mangoes4.jpg',
//     'profile/lebron_james.jpg'
// ]

// for file_key in test_files:
//     try:
//         # Check if file exists
//         s3.head_object(Bucket=bucket, Key=file_key)
//         print(f"✅ File exists: {file_key}")
        
//         # Get URL
//         url = f"https://{bucket}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{file_key}"
//         print(f"   URL: {url}")
        
//         # Check permissions
//         try:
//             # Try to get the object ACL
//             acl = s3.get_object_acl(Bucket=bucket, Key=file_key)
//             public = any(
//                 grant.get('Grantee', {}).get('URI') == 'http://acs.amazonaws.com/groups/global/AllUsers'
//                 for grant in acl['Grants']
//             )
//             print(f"   Public read: {'✅ Yes' if public else '❌ No'}")
//         except:
//             print(f"   Public read: ❓ Could not check")
            
//     except ClientError as e:
//         if e.response['Error']['Code'] == '404':
//             print(f"❌ File NOT FOUND: {file_key}")
//         else:
//             print(f"⚠️  Error checking {file_key}: {e}")

// # List all files in profile folder
// print("\n📁 Listing all files in 'profile/' folder:")
// try:
//     response = s3.list_objects_v2(Bucket=bucket, Prefix='profile/')
    
//     if 'Contents' in response:
//         for obj in response['Contents']:
//             print(f"   📄 {obj['Key']} - {obj['Size']} bytes")
//     else:
//         print("   📭 No files found in profile/ folder")
        
// except Exception as e:
//     print(f"❌ Error listing files: {e}")



// check_storage.py
// import os
// import django
// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// from django.conf import settings

// print("=" * 70)
// print("STORAGE CONFIGURATION CHECK")
// print("=" * 70)

// # Check AWS credentials
// print("\n🔑 AWS CREDENTIALS:")
// print(f"AWS_ACCESS_KEY_ID: {'✓ SET' if settings.AWS_ACCESS_KEY_ID else '✗ MISSING'}")
// print(f"AWS_SECRET_ACCESS_KEY: {'✓ SET' if settings.AWS_SECRET_ACCESS_KEY else '✗ MISSING'}")
// print(f"AWS_STORAGE_BUCKET_NAME: {settings.AWS_STORAGE_BUCKET_NAME}")
// print(f"AWS_S3_REGION_NAME: {settings.AWS_S3_REGION_NAME}")
// print(f"AWS_S3_CUSTOM_DOMAIN: {getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', 'Not set')}")

// # Check storage settings
// print("\n💾 STORAGE SETTINGS:")
// print(f"DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
// print(f"MEDIA_URL: {settings.MEDIA_URL}")

// # Check if using S3
// if hasattr(settings, 'DEFAULT_FILE_STORAGE'):
//     if 's3' in settings.DEFAULT_FILE_STORAGE.lower():
//         print("✅ USING S3 STORAGE")
//     else:
//         print("⚠️  USING LOCAL FILESYSTEM STORAGE")

// # Test actual storage
// print("\n🧪 TESTING ACTUAL STORAGE:")
// from django.core.files.storage import default_storage
// print(f"Default storage class: {default_storage.__class__.__name__}")

// if hasattr(default_storage, 'bucket_name'):
//     print(f"✅ S3 Storage Active - Bucket: {default_storage.bucket_name}")
// else:
//     print(f"⚠️  Local Filesystem Storage Active")

// print("=" * 70)



// create_test_user.py
// import os
// import django
// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// from django.contrib.auth.models import User
// from users.models import Profile
// from django.core.files import File

// # Create a test user
// test_user, created = User.objects.get_or_create(
//     username='testuser_with_image',
//     defaults={
//         'email': 'testuser@example.com',
//         'password': 'testpass123'
//     }
// )

// if created:
//     print(f"✅ Created test user: {test_user.username}")
    
//     # Get or create profile
//     profile, _ = Profile.objects.get_or_create(user=test_user)
//     profile.fullname = "Test User With Image"
//     profile.role = "PATIENT"
    
//     # Create a simple test image file
//     from io import BytesIO
//     from PIL import Image
//     import tempfile
    
//     # Create a simple red image
//     img = Image.new('RGB', (100, 100), color='red')
    
//     # Save to temp file
//     with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
//         img.save(tmp, format='JPEG')
//         tmp_path = tmp.name
    
//     # Save to profile
//     with open(tmp_path, 'rb') as f:
//         profile.profile_pix.save(f'testuser_{test_user.id}.jpg', File(f))
    
//     profile.save()
    
//     # Clean up temp file
//     os.unlink(tmp_path)
    
//     print(f"✅ Added test image to profile")
//     print(f"   Image name: {profile.profile_pix.name}")
//     print(f"   Image URL: {profile.profile_pix.url}")
// else:
//     print(f"ℹ️  Test user already exists: {test_user.username}")


// debug_image_upload.py
// import os
// import sys
// import django
// from io import BytesIO
// from django.core.files.uploadedfile import SimpleUploadedFile
// from PIL import Image

// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// print("🔍 Debugging Image Upload...")

// from hospital.models import BlogPost
// from users.models import Profile

// # Get admin
// admin = Profile.objects.filter(role='ADMIN').first()
// print(f"Admin: {admin}")

// # Create test image
// img = Image.new('RGB', (100, 100), color='blue')
// img_byte_arr = BytesIO()
// img.save(img_byte_arr, format='JPEG')
// img_byte_arr.seek(0)

// test_image = SimpleUploadedFile(
//     name='debug_test.jpg',
//     content=img_byte_arr.read(),
//     content_type='image/jpeg'
// )

// print(f"Test image created: {test_image.name} ({test_image.size} bytes)")

// # Try to create blog post
// try:
//     post = BlogPost(
//         title="Debug Test",
//         description="Debugging",
//         content="<h1>Debug</h1>",
//         author=admin,
//         published=False
//     )
    
//     # Manually set the image
//     post.featured_image = test_image
    
//     # Save
//     post.save()
    
//     print(f"✅ Success! Post ID: {post.id}")
//     print(f"   Image name: {post.featured_image.name}")
//     print(f"   Image URL: {post.featured_image.url if post.featured_image else 'None'}")
    
//     # Check if file was uploaded to S3
//     import time
//     time.sleep(2)  # Wait for upload
    
//     if post.featured_image and post.featured_image.storage.exists(post.featured_image.name):
//         print(f"   ✅ Image uploaded to S3!")
//     else:
//         print(f"   ⚠️  Image may not be in S3 yet")
        
// except Exception as e:
//     print(f"❌ Error: {e}")
//     import traceback
//     traceback.print_exc()




// runtime.txt
// python-3.11.0


// test_blog_creation.py
// import os
// import sys
// import django

// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// from django.conf import settings
// from hospital.models import BlogPost
// from users.models import Profile
// import requests
// from io import BytesIO

// def test_blog_creation():
//     """Test blog creation workflow"""
//     print("🔧 Testing Blog Creation Workflow...")
    
//     # Get admin user
//     admin = Profile.objects.filter(role='ADMIN').first()
//     if not admin:
//         print("❌ No admin user found")
//         return
    
//     print(f"✅ Using admin: {admin.fullname}")
    
//     # Test 1: Create blog without images
//     print("\n1. Testing blog creation WITHOUT images...")
//     try:
//         post1 = BlogPost.objects.create(
//             title="Test Post No Images",
//             description="Test description",
//             content="<h1>Test</h1><p>Content</p><h2>Section 1</h2><p>More</p>",
//             author=admin,
//             published=False
//         )
//         print(f"   ✅ Created: {post1.id} - {post1.title}")
//         print(f"   Slug: {post1.slug}")
//     except Exception as e:
//         print(f"   ❌ Failed: {e}")
    
//     # Test 2: Try to get blog posts via API
//     print("\n2. Testing API endpoint...")
//     try:
//         # Simulate API call
//         from hospital.serializers import BlogPostSerializer
//         serializer = BlogPostSerializer(post1)
//         data = serializer.data
//         print(f"   ✅ Serializer worked")
//         print(f"   Featured image URL: {data.get('featured_image')}")
//     except Exception as e:
//         print(f"   ❌ Serializer failed: {e}")
//         import traceback
//         traceback.print_exc()

// if __name__ == '__main__':
//     test_blog_creation()


// test_blog_upload.ts
// import os
// import django
// import sys

// # Setup Django
// sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// from hospital.models import BlogPost
// from django.core.files import File
// import tempfile
// from PIL import Image
// import time
// import requests

// print('Creating a new blog post with image...')
// print('=' * 60)

// # Create test image
// with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
//     img = Image.new('RGB', (300, 200), color='blue')
//     img.save(tmp.name, 'JPEG')
//     tmp_path = tmp.name

// print(f'Created test image: {tmp_path}')

// # Create blog post
// timestamp = int(time.time())
// try:
//     blog_post = BlogPost.objects.create(
//         title=f'Test Blog Post {timestamp}',
//         slug=f'test-blog-post-{timestamp}',
//         content='Test content for new blog post',
//         description='Test description',
//         published=True,
//         author_id=1  # Make sure you have a user with ID 1
//     )
    
//     print(f'Created blog post: {blog_post.title}')
    
//     # Upload image
//     with open(tmp_path, 'rb') as f:
//         blog_post.featured_image.save(f'test_blog_{timestamp}.jpg', File(f))
//         blog_post.save()
    
//     print(f'Image uploaded: {blog_post.featured_image.name}')
//     print(f'Image URL: {blog_post.featured_image.url}')
    
//     # Test the image URL
//     url = blog_post.featured_image.url
    
//     # Force global URL if needed
//     if '.s3.eu-north-1.amazonaws.com' in url:
//         url = url.replace('.s3.eu-north-1.amazonaws.com', '.s3.amazonaws.com')
    
//     print(f'Testing URL: {url}')
//     resp = requests.head(url)
//     print(f'Status: {resp.status_code}')
    
//     if resp.status_code == 200:
//         print('SUCCESS! New blog images will work!')
//     else:
//         print(f'Failed with status: {resp.status_code}')
    
//     # Cleanup
//     os.unlink(tmp_path)
//     print('Cleaned up temporary file')
    
// except Exception as e:
//     print(f'Error: {e}')
//     import traceback
//     traceback.print_exc()
    
//     # Cleanup on error
//     if os.path.exists(tmp_path):
//         os.unlink(tmp_path)


// test_profile_images.py
// #!/usr/bin/env python
// import os
// import sys
// import django
// from io import BytesIO
// from PIL import Image

// # Setup Django
// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

// try:
//     django.setup()
//     print("✅ Django setup successful")
// except Exception as e:
//     print(f"❌ Django setup failed: {e}")
//     sys.exit(1)

// from django.core.files.uploadedfile import SimpleUploadedFile
// from hospital.models import BlogPost
// from users.models import Profile

// def test_image_upload():
//     print("🧪 Testing Image Upload to Blog Post...")
    
//     # Get admin user
//     try:
//         admin = Profile.objects.filter(role='ADMIN').first()
//         if not admin:
//             print("❌ No admin user found")
//             return
//         print(f"✅ Admin user: {admin.fullname}")
//     except Exception as e:
//         print(f"❌ Error getting admin: {e}")
//         return
    
//     # Create a simple test image
//     try:
//         print("📸 Creating test image...")
//         img = Image.new('RGB', (100, 100), color='red')
//         img_byte_arr = BytesIO()
//         img.save(img_byte_arr, format='JPEG')
//         img_byte_arr.seek(0)
        
//         test_image = SimpleUploadedFile(
//             name='test_image.jpg',
//             content=img_byte_arr.read(),
//             content_type='image/jpeg'
//         )
//         print(f"✅ Test image created: {test_image.name} ({test_image.size} bytes)")
//     except Exception as e:
//         print(f"❌ Error creating test image: {e}")
//         # Try without PIL
//         print("🔄 Trying alternative method...")
//         test_image = SimpleUploadedFile(
//             name='test.txt',
//             content=b'Test content',
//             content_type='text/plain'
//         )
    
//     # Try to create blog post with image
//     try:
//         print("\n📝 Creating blog post with image...")
//         post = BlogPost.objects.create(
//             title="Test Post With Image",
//             description="Testing image upload functionality",
//             content="<h1>Image Test</h1><p>Testing if images upload correctly</p><h2>Section 1</h2><p>More content</p>",
//             author=admin,
//             published=False,
//             featured_image=test_image
//         )
        
//         print(f"✅ Blog post created! ID: {post.id}")
//         print(f"📝 Title: {post.title}")
//         print(f"📸 Featured image: {post.featured_image}")
//         print(f"📸 Image name: {post.featured_image.name if post.featured_image else 'None'}")
        
//         if post.featured_image:
//             try:
//                 print(f"📸 Image URL: {post.featured_image.url}")
                
//                 # Check if file exists in storage
//                 import time
//                 print("⏳ Waiting for S3 upload...")
//                 time.sleep(3)  # Wait for async upload
                
//                 if hasattr(post.featured_image, 'storage') and post.featured_image.storage.exists(post.featured_image.name):
//                     print("✅ Image successfully uploaded to S3!")
//                 else:
//                     print("⚠️  Image may not be in S3 yet (could be async)")
                    
//             except Exception as e:
//                 print(f"⚠️  Could not get image URL: {e}")
        
//     except Exception as e:
//         print(f"❌ Error creating blog post: {e}")
//         import traceback
//         traceback.print_exc()
        
//         # Try without image first
//         print("\n🔄 Trying without image...")
//         try:
//             post_no_image = BlogPost.objects.create(
//                 title="Test Post No Image",
//                 description="Testing without image",
//                 content="<h1>No Image Test</h1><p>Testing</p>",
//                 author=admin,
//                 published=False
//             )
//             print(f"✅ Created without image: {post_no_image.id}")
//         except Exception as e2:
//             print(f"❌ Also failed without image: {e2}")

// if __name__ == '__main__':
//     test_image_upload()


// test_s3_fix.py
// import os
// import django
// import sys

// # Setup Django
// sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// from hospital.models import BlogPost
// from django.core.files import File
// import tempfile
// from PIL import Image
// import time
// import requests

// print('Testing S3 upload and access...')

// # Create test image
// with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
//     img = Image.new('RGB', (100, 100), color='red')
//     img.save(tmp.name, 'JPEG')
//     tmp_path = tmp.name

// print(f'Created test image: {tmp_path}')

// # Get or create test blog post
// timestamp = int(time.time())
// blog_post, created = BlogPost.objects.get_or_create(
//     title=f'Test S3 Fix {timestamp}',
//     defaults={
//         'slug': f'test-s3-fix-{timestamp}',
//         'content': 'Test content',
//         'author_id': 1  # Make sure you have a user with ID 1
//     }
// )

// print(f'Using blog post: {blog_post.title} ({"Created" if created else "Existing"})')

// # Upload the image
// try:
//     with open(tmp_path, 'rb') as f:
//         blog_post.featured_image.save(f'test_fix_{timestamp}.jpg', File(f))
//         blog_post.save()
    
//     print(f'Uploaded file to S3')
//     print(f'File URL: {blog_post.featured_image.url}')
//     print(f'File path: {blog_post.featured_image.name}')
    
//     # Test URL access
//     url = blog_post.featured_image.url
//     print(f'\nTesting URL: {url}')
    
//     # Try both regional and global endpoints
//     if 's3.eu-north-1.amazonaws.com' in url:
//         global_url = url.replace('s3.eu-north-1.amazonaws.com', 's3.amazonaws.com')
//         print(f'Also testing global URL: {global_url}')
        
//         try:
//             response = requests.head(global_url, timeout=5)
//             print(f'Global URL Status: {response.status_code}')
//         except Exception as e:
//             print(f'Global URL Error: {e}')
    
//     try:
//         response = requests.head(url, timeout=5)
//         print(f'Regional URL Status: {response.status_code}')
//     except Exception as e:
//         print(f'Regional URL Error: {e}')
    
//     # Cleanup
//     os.unlink(tmp_path)
//     print(f'\nCleaned up temporary file')
    
// except Exception as e:
//     print(f'Error: {e}')
//     import traceback
//     traceback.print_exc()


// test_s3_upload.py
// #!/usr/bin/env python
// import os
// import sys
// import django

// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// from django.conf import settings
// import boto3
// from botocore.exceptions import ClientError

// def test_s3_upload():
//     """Test direct S3 upload to diagnose issues"""
//     print("🔧 Testing S3 Upload...")
    
//     # Check settings
//     print(f"Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
//     print(f"Region: {settings.AWS_S3_REGION_NAME}")
//     print(f"Access Key: {'Set' if settings.AWS_ACCESS_KEY_ID else 'Not set'}")
    
//     # Setup S3 client
//     s3 = boto3.client(
//         's3',
//         aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
//         aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
//         region_name=settings.AWS_S3_REGION_NAME
//     )
    
//     # Test upload
//     test_content = b"Test image content"
//     test_key = "media/test_upload.txt"
    
//     try:
//         # Upload test file
//         s3.put_object(
//             Bucket=settings.AWS_STORAGE_BUCKET_NAME,
//             Key=test_key,
//             Body=test_content,
//             ContentType='text/plain',
//             ACL='public-read'
//         )
//         print(f"✅ Test upload successful: {test_key}")
        
//         # Check if it exists
//         response = s3.head_object(
//             Bucket=settings.AWS_STORAGE_BUCKET_NAME,
//             Key=test_key
//         )
//         print(f"✅ File exists with size: {response['ContentLength']} bytes")
        
//         # Generate URL
//         url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{test_key}"
//         print(f"🔗 URL: {url}")
        
//         # Clean up
//         s3.delete_object(
//             Bucket=settings.AWS_STORAGE_BUCKET_NAME,
//             Key=test_key
//         )
//         print("🧹 Test file cleaned up")
        
//     except ClientError as e:
//         print(f"❌ S3 Error: {e}")
//     except Exception as e:
//         print(f"❌ General Error: {e}")

// if __name__ == '__main__':
//     test_s3_upload()


// test_s3.py
// import boto3
// import os
// from decouple import config

// # Load environment variables
// AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
// AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
// AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
// AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME')

// print("🔍 Testing AWS S3 Connection...")
// print(f"Bucket: {AWS_STORAGE_BUCKET_NAME}")
// print(f"Region: {AWS_S3_REGION_NAME}")

// try:
//     # Create S3 client
//     s3 = boto3.client(
//         's3',
//         aws_access_key_id=AWS_ACCESS_KEY_ID,
//         aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
//         region_name=AWS_S3_REGION_NAME
//     )
    
//     # Test connection by listing buckets
//     response = s3.list_buckets()
//     buckets = [bucket['Name'] for bucket in response['Buckets']]
    
//     print(f"✅ Connected to AWS S3 successfully!")
//     print(f"Available buckets: {buckets}")
    
//     # Check if our bucket exists
//     if AWS_STORAGE_BUCKET_NAME in buckets:
//         print(f"✅ Bucket '{AWS_STORAGE_BUCKET_NAME}' exists!")
        
//         # List objects in the bucket
//         objects = s3.list_objects_v2(Bucket=AWS_STORAGE_BUCKET_NAME, Prefix='media/')
//         if 'Contents' in objects:
//             print(f"✅ Found {len(objects['Contents'])} objects in bucket")
//             for obj in objects['Contents'][:5]:  # Show first 5
//                 print(f"  - {obj['Key']} ({obj['Size']} bytes)")
//         else:
//             print("ℹ️  No objects found in bucket yet")
//     else:
//         print(f"❌ Bucket '{AWS_STORAGE_BUCKET_NAME}' not found!")
//         print("You need to create the bucket first.")
        
// except Exception as e:
//     print(f"❌ AWS S3 Connection Failed: {str(e)}")

// test_storage.py
// import os
// import django
// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// from django.conf import settings
// from django.core.files.storage import default_storage

// print("=" * 60)
// print("STORAGE DEBUG TEST")
// print("=" * 60)

// print(f"1. Default storage class: {default_storage.__class__.__name__}")
// print(f"2. Storage module: {default_storage.__module__}")

// # Check if it's S3 storage
// if hasattr(default_storage, 'bucket_name'):
//     print(f"3. S3 Bucket: {default_storage.bucket_name}")
//     print(f"4. S3 Region: {getattr(default_storage, 'region_name', 'Not set')}")
//     print(f"5. Custom Domain: {getattr(default_storage, 'custom_domain', 'Not set')}")
    
//     # Test URL generation
//     test_path = 'test/test_image.jpg'
//     try:
//         url = default_storage.url(test_path)
//         print(f"6. Test URL for '{test_path}': {url}")
//     except Exception as e:
//         print(f"6. Error generating URL: {e}")
// else:
//     print("3. Not using S3 storage (using local filesystem)")

// print(f"7. MEDIA_URL from settings: {settings.MEDIA_URL}")
// print(f"8. AWS_S3_CUSTOM_DOMAIN: {getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', 'Not set')}")

// # Test with actual profile
// try:
//     from users.models import Profile
//     profile = Profile.objects.filter(profile_pix__isnull=False).first()
//     if profile and profile.profile_pix:
//         print(f"\n9. Testing actual profile image:")
//         print(f"   Username: {profile.user.username}")
//         print(f"   Image name: {profile.profile_pix.name}")
//         print(f"   Storage class: {profile.profile_pix.storage.__class__.__name__}")
//         print(f"   URL from .url: {profile.profile_pix.url}")
// except Exception as e:
//     print(f"\n9. Error testing profile: {e}")

// print("=" * 60)


// upload_local_images.py
// import os
// import sys
// import django
// import boto3
// from pathlib import Path

// # Setup Django
// BASE_DIR = Path(__file__).resolve().parent
// sys.path.append(str(BASE_DIR))
// os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
// django.setup()

// from django.conf import settings

// s3 = boto3.client('s3',
//     aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
//     aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
//     region_name=settings.AWS_S3_REGION_NAME
// )

// # Correct path to media folder
// MEDIA_ROOT = BASE_DIR / 'media'
// BLOG_IMAGES_DIR = MEDIA_ROOT / 'blog_images'

// print(f'Uploading images from: {BLOG_IMAGES_DIR}')
// print('=' * 60)

// if BLOG_IMAGES_DIR.exists():
//     image_files = list(BLOG_IMAGES_DIR.glob('*'))
//     print(f'Found {len(image_files)} image files')
    
//     uploaded_count = 0
//     for file_path in image_files:
//         if file_path.is_file():
//             s3_key = f'media/blog_images/{file_path.name}'
//             print(f'Uploading: {file_path.name} -> {s3_key}')
            
//             try:
//                 # Determine content type
//                 content_type = 'application/octet-stream'
//                 if file_path.suffix.lower() in ['.jpg', '.jpeg']:
//                     content_type = 'image/jpeg'
//                 elif file_path.suffix.lower() == '.png':
//                     content_type = 'image/png'
//                 elif file_path.suffix.lower() == '.gif':
//                     content_type = 'image/gif'
//                 elif file_path.suffix.lower() == '.webp':
//                     content_type = 'image/webp'
                
//                 with open(file_path, 'rb') as f:
//                     s3.upload_fileobj(
//                         f,
//                         settings.AWS_STORAGE_BUCKET_NAME,
//                         s3_key,
//                         ExtraArgs={
//                             'ACL': 'public-read',
//                             'ContentType': content_type,
//                             'CacheControl': 'max-age=86400'
//                         }
//                     )
//                 print(f'  ✅ Uploaded with public-read ACL')
//                 uploaded_count += 1
                
//                 # Test the upload
//                 import requests
//                 url = f'https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{s3_key}'
//                 try:
//                     resp = requests.head(url, timeout=5)
//                     print(f'  Test status: {resp.status_code}')
//                 except:
//                     print(f'  Could not test URL')
                    
//             except Exception as e:
//                 print(f'  ❌ Error: {str(e)[:100]}')
    
//     print('=' * 60)
//     print(f'Upload complete: {uploaded_count}/{len(image_files)} files uploaded')
    
// else:
//     print('❌ Blog images directory not found')
