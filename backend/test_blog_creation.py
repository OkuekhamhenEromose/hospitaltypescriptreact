#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.conf import settings
from hospital.models import BlogPost
from users.models import Profile
import requests
from io import BytesIO

def test_blog_creation():
    """Test blog creation workflow"""
    print("🔧 Testing Blog Creation Workflow...")
    
    # Get admin user
    admin = Profile.objects.filter(role='ADMIN').first()
    if not admin:
        print("❌ No admin user found")
        return
    
    print(f"✅ Using admin: {admin.fullname}")
    
    # Test 1: Create blog without images
    print("\n1. Testing blog creation WITHOUT images...")
    try:
        post1 = BlogPost.objects.create(
            title="Test Post No Images",
            description="Test description",
            content="<h1>Test</h1><p>Content</p><h2>Section 1</h2><p>More</p>",
            author=admin,
            published=False
        )
        print(f"   ✅ Created: {post1.id} - {post1.title}")
        print(f"   Slug: {post1.slug}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 2: Try to get blog posts via API
    print("\n2. Testing API endpoint...")
    try:
        # Simulate API call
        from hospital.serializers import BlogPostSerializer
        serializer = BlogPostSerializer(post1)
        data = serializer.data
        print(f"   ✅ Serializer worked")
        print(f"   Featured image URL: {data.get('featured_image')}")
    except Exception as e:
        print(f"   ❌ Serializer failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_blog_creation()