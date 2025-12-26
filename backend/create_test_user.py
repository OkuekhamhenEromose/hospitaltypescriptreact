# create_test_user.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Profile
from django.core.files import File

# Create a test user
test_user, created = User.objects.get_or_create(
    username='testuser_with_image',
    defaults={
        'email': 'testuser@example.com',
        'password': 'testpass123'
    }
)

if created:
    print(f"✅ Created test user: {test_user.username}")
    
    # Get or create profile
    profile, _ = Profile.objects.get_or_create(user=test_user)
    profile.fullname = "Test User With Image"
    profile.role = "PATIENT"
    
    # Create a simple test image file
    from io import BytesIO
    from PIL import Image
    import tempfile
    
    # Create a simple red image
    img = Image.new('RGB', (100, 100), color='red')
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        img.save(tmp, format='JPEG')
        tmp_path = tmp.name
    
    # Save to profile
    with open(tmp_path, 'rb') as f:
        profile.profile_pix.save(f'testuser_{test_user.id}.jpg', File(f))
    
    profile.save()
    
    # Clean up temp file
    os.unlink(tmp_path)
    
    print(f"✅ Added test image to profile")
    print(f"   Image name: {profile.profile_pix.name}")
    print(f"   Image URL: {profile.profile_pix.url}")
else:
    print(f"ℹ️  Test user already exists: {test_user.username}")