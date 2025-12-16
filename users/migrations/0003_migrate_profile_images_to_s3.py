# users/migrations/0003_migrate_profile_images_to_s3.py
from django.db import migrations
import boto3
from django.conf import settings
from PIL import Image
import io
import hashlib

def migrate_profile_images_to_s3(apps, schema_editor):
    """
    Migrate all profile images from local filesystem references to S3.
    Creates placeholders for missing files.
    """
    print("\n" + "="*60)
    print("🚚 Starting profile image migration to S3...")
    print("="*60)
    
    Profile = apps.get_model('users', 'Profile')
    
    # Initialize S3 client
    try:
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    except AttributeError:
        print("❌ AWS settings not configured. Skipping migration.")
        return
    
    migrated = 0
    skipped = 0
    errors = 0
    
    for profile in Profile.objects.all():
        username = profile.user.username
        
        if not profile.profile_pix:
            print(f"ℹ️  {username}: No profile image, skipping")
            skipped += 1
            continue
        
        # Get filename (e.g., 'profile/mangoes4.jpg')
        filename = profile.profile_pix.name
        s3_key = f"media/{filename}"  # S3 path
        
        print(f"\n👤 Processing {username}: {filename}")
        
        # Check if already in S3
        try:
            s3.head_object(Bucket=bucket_name, Key=s3_key)
            print(f"   ✅ Already exists in S3")
            migrated += 1
            continue
        except:
            pass  # Needs migration
        
        # Try to get local file content
        try:
            with profile.profile_pix.open('rb') as f:
                file_content = f.read()
            
            # Determine content type
            if filename.lower().endswith('.png'):
                content_type = 'image/png'
            elif filename.lower().endswith('.gif'):
                content_type = 'image/gif'
            else:
                content_type = 'image/jpeg'
            
            # Upload to S3
            s3.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=content_type,
                ACL='public-read',
                Metadata={'migrated': 'true', 'username': username}
            )
            
            print(f"   ✅ Migrated to S3 ({len(file_content)} bytes)")
            migrated += 1
            
        except (FileNotFoundError, OSError):
            # Local file doesn't exist - create placeholder
            print(f"   ⚠️  Local file missing, creating placeholder...")
            
            # Generate consistent color from username
            hash_obj = hashlib.md5(username.encode())
            color_hex = hash_obj.hexdigest()[:6]
            color = f'#{color_hex}'
            
            # Create placeholder
            img = Image.new('RGB', (300, 300), color=color)
            img_buffer = io.BytesIO()
            
            if filename.lower().endswith('.png'):
                img.save(img_buffer, format='PNG')
                content_type = 'image/png'
            else:
                img.save(img_buffer, format='JPEG', quality=85)
                content_type = 'image/jpeg'
            
            img_buffer.seek(0)
            image_data = img_buffer.getvalue()
            
            # Upload placeholder
            s3.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=image_data,
                ContentType=content_type,
                ACL='public-read',
                Metadata={
                    'migrated': 'true',
                    'placeholder': 'true',
                    'original_filename': filename,
                    'username': username
                }
            )
            
            print(f"   ✅ Created placeholder in S3 ({len(image_data)} bytes)")
            migrated += 1
            
        except Exception as e:
            print(f"   ❌ Error migrating {username}: {str(e)[:100]}...")
            errors += 1
    
    print(f"\n{'='*60}")
    print(f"📊 MIGRATION COMPLETED:")
    print(f"   ✅ Migrated: {migrated} profiles")
    print(f"   ℹ️  Skipped: {skipped} profiles")
    print(f"   ❌ Errors: {errors} profiles")
    print(f"{'='*60}")

def reverse_migration(apps, schema_editor):
    """
    Reverse migration - doesn't delete S3 files, just prints info.
    """
    print("\n⚠️  Reverse migration: S3 files will NOT be deleted.")
    print("   Profile image references remain in S3 storage.")

class Migration(migrations.Migration):
    # Replace '0002_xxxx' with your actual last migration
    dependencies = [
        ('users', '0002_auto_20241215_xxxx'),  # CHANGE THIS!
    ]
    
    operations = [
        migrations.RunPython(
            migrate_profile_images_to_s3,
            reverse_migration,
        ),
    ]