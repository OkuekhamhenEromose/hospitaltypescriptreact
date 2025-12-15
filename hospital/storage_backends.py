# hospital/storage_backends.py - IMPROVED VERSION
from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    default_acl = 'public-read'
    
    # Use the custom domain from settings
    def __init__(self, *args, **kwargs):
        # Set custom domain BEFORE calling parent init
        self.custom_domain = settings.AWS_S3_CUSTOM_DOMAIN
        
        # Set region name
        self.region_name = settings.AWS_S3_REGION_NAME
        
        # Set bucket name
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        
        # Call parent init
        super().__init__(*args, **kwargs)
        
        logger.info(f"✅ MediaStorage initialized:")
        logger.info(f"   - Bucket: {self.bucket_name}")
        logger.info(f"   - Region: {self.region_name}")
        logger.info(f"   - Custom Domain: {self.custom_domain}")
    
    def url(self, name, parameters=None, expire=None):
        """
        Generate the correct S3 URL with forced HTTPS
        """
        try:
            # Get base URL
            url = super().url(name, parameters, expire)
            
            # Force HTTPS
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            
            # Ensure correct domain format
            if 's3.amazonaws.com' in url:
                url = url.replace('.s3.amazonaws.com', f'.s3.{self.region_name}.amazonaws.com')
            
            logger.debug(f"📸 Generated URL for {name}: {url}")
            return url
            
        except Exception as e:
            logger.error(f"❌ Error generating URL for {name}: {e}")
            # Fallback: construct URL manually
            return f"https://{self.custom_domain}/{self.location}/{name}"
    
    def _get_write_parameters(self, name, content=None):
        """
        Override to ensure ACL is always set to public-read
        """
        params = super()._get_write_parameters(name, content)
        
        # Force ACL to public-read
        params['ACL'] = 'public-read'
        
        # Add cache control
        params['CacheControl'] = 'max-age=86400'
        
        return params