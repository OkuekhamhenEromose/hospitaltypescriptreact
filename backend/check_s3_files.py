# check_s3_files.py
import boto3
from botocore.exceptions import ClientError
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
import django
django.setup()

from django.conf import settings

print("🔍 Checking S3 files...")

# Initialize S3 client
s3 = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)

bucket = settings.AWS_STORAGE_BUCKET_NAME

# Test files
test_files = [
    'profile/jameslebron_profile.jpg',
    'profile/debronjames_profile.jpg',
    'profile/mangoes4.jpg',
    'profile/lebron_james.jpg'
]

for file_key in test_files:
    try:
        # Check if file exists
        s3.head_object(Bucket=bucket, Key=file_key)
        print(f"✅ File exists: {file_key}")
        
        # Get URL
        url = f"https://{bucket}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{file_key}"
        print(f"   URL: {url}")
        
        # Check permissions
        try:
            # Try to get the object ACL
            acl = s3.get_object_acl(Bucket=bucket, Key=file_key)
            public = any(
                grant.get('Grantee', {}).get('URI') == 'http://acs.amazonaws.com/groups/global/AllUsers'
                for grant in acl['Grants']
            )
            print(f"   Public read: {'✅ Yes' if public else '❌ No'}")
        except:
            print(f"   Public read: ❓ Could not check")
            
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            print(f"❌ File NOT FOUND: {file_key}")
        else:
            print(f"⚠️  Error checking {file_key}: {e}")

# List all files in profile folder
print("\n📁 Listing all files in 'profile/' folder:")
try:
    response = s3.list_objects_v2(Bucket=bucket, Prefix='profile/')
    
    if 'Contents' in response:
        for obj in response['Contents']:
            print(f"   📄 {obj['Key']} - {obj['Size']} bytes")
    else:
        print("   📭 No files found in profile/ folder")
        
except Exception as e:
    print(f"❌ Error listing files: {e}")