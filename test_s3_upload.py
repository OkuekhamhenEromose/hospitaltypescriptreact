#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.conf import settings
import boto3
from botocore.exceptions import ClientError

def test_s3_upload():
    """Test direct S3 upload to diagnose issues"""
    print("🔧 Testing S3 Upload...")
    
    # Check settings
    print(f"Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
    print(f"Region: {settings.AWS_S3_REGION_NAME}")
    print(f"Access Key: {'Set' if settings.AWS_ACCESS_KEY_ID else 'Not set'}")
    
    # Setup S3 client
    s3 = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )
    
    # Test upload
    test_content = b"Test image content"
    test_key = "media/test_upload.txt"
    
    try:
        # Upload test file
        s3.put_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=test_key,
            Body=test_content,
            ContentType='text/plain',
            ACL='public-read'
        )
        print(f"✅ Test upload successful: {test_key}")
        
        # Check if it exists
        response = s3.head_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=test_key
        )
        print(f"✅ File exists with size: {response['ContentLength']} bytes")
        
        # Generate URL
        url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{test_key}"
        print(f"🔗 URL: {url}")
        
        # Clean up
        s3.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=test_key
        )
        print("🧹 Test file cleaned up")
        
    except ClientError as e:
        print(f"❌ S3 Error: {e}")
    except Exception as e:
        print(f"❌ General Error: {e}")

if __name__ == '__main__':
    test_s3_upload()