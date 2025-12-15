# test_profile_images.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from users.models import Profile
from users.serializers import ProfileSerializer

print("=" * 70)
print("PROFILE IMAGES DIAGNOSTIC")
print("=" * 70)

# Check all profiles
profiles = Profile.objects.all().select_related('user')

for profile in profiles:
    print(f"\n👤 {profile.user.username} ({profile.user.email}):")
    print(f"   Role: {profile.role}")
    print(f"   Has profile_pix field: {bool(profile.profile_pix)}")
    
    if profile.profile_pix:
        print(f"   Image name: '{profile.profile_pix.name}'")
        print(f"   Image storage: {profile.profile_pix.storage.__class__.__name__}")
        
        # Try to get URL
        try:
            url = profile.profile_pix.url
            print(f"   ✅ Model URL: {url}")
        except ValueError as e:
            print(f"   ❌ Model URL Error: {e}")
        except Exception as e:
            print(f"   ❌ Other Error: {e}")
        
        # Try serializer
        try:
            serializer = ProfileSerializer(profile)
            serialized_url = serializer.data.get('profile_pix')
            print(f"   📋 Serializer URL: {serialized_url}")
        except Exception as e:
            print(f"   ❌ Serializer Error: {e}")
    else:
        print(f"   No profile image set")
    
    print("-" * 50)

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

profiles_with_images = [p for p in profiles if p.profile_pix and str(p.profile_pix.name).strip()]
profiles_with_empty_images = [p for p in profiles if p.profile_pix and not str(p.profile_pix.name).strip()]
profiles_without_images = [p for p in profiles if not p.profile_pix]

print(f"Total profiles: {profiles.count()}")
print(f"Profiles with valid images: {len(profiles_with_images)}")
print(f"Profiles with empty image fields: {len(profiles_with_empty_images)}")
print(f"Profiles without images: {len(profiles_without_images)}")

if profiles_with_empty_images:
    print("\n⚠️  Profiles with empty image fields (need fixing):")
    for p in profiles_with_empty_images:
        print(f"   - {p.user.username}")