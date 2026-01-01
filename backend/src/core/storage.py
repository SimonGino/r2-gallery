import boto3
from botocore.config import Config

from .config import get_settings

settings = get_settings()


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.CLOUDFLARE_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(
            signature_version="s3v4", retries={"max_attempts": 3, "mode": "standard"}
        ),
    )
