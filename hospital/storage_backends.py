# hospital/storage_backends.py - ENHANCED VERSION
from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

class MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    default_acl = 'public-read'
    
    # Use the custom domain from settings
    def __init__(self, *args, **kwargs):
        # Force HTTPS and correct domain
        self.custom_domain = settings.AWS_S3_CUSTOM_DOMAIN
        self.secure_urls = True
        
        # Call parent init
        super().__init__(*args, **kwargs)
        
        logger.info(f"✅ MediaStorage initialized for bucket: {self.bucket_name}")
    
    def _save(self, name, content):
        """
        Override save to ensure files are actually uploaded to S3
        """
        try:
            logger.info(f"💾 Attempting to save file to S3: {name}")
            
            # Call parent save
            saved_name = super()._save(name, content)
            
            logger.info(f"✅ File saved to S3: {saved_name}")
            
            # Verify the file was uploaded
            self._verify_upload(saved_name)
            
            return saved_name
            
        except Exception as e:
            logger.error(f"❌ Failed to save {name} to S3: {e}")
            raise
    
    def _verify_upload(self, name):
        """Verify that file was actually uploaded to S3"""
        try:
            # Check if file exists in S3
            self.connection.meta.client.head_object(
                Bucket=self.bucket_name,
                Key=self.location + '/' + name if self.location else name
            )
            logger.info(f"✅ Verified upload: {name} exists in S3")
            
            # Make sure it's publicly accessible
            self.connection.meta.client.put_object_acl(
                Bucket=self.bucket_name,
                Key=self.location + '/' + name if self.location else name,
                ACL='public-read'
            )
            logger.info(f"✅ Set public-read ACL for: {name}")
            
        except ClientError as e:
            logger.error(f"❌ Verification failed for {name}: {e}")
    
    def url(self, name, parameters=None, expire=None):
        """
        Generate the correct S3 URL
        """
        try:
            # Get base URL
            url = super().url(name, parameters, expire)
            
            # Force HTTPS
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            
            logger.debug(f"📸 Generated URL for {name}: {url}")
            return url
            
        except Exception as e:
            logger.error(f"❌ Error generating URL for {name}: {e}")
            # Fallback: construct URL manually
            return f"https://{self.custom_domain}/{self.location}/{name}" if self.location else f"https://{self.custom_domain}/{name}"