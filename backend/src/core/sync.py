import asyncio
from datetime import datetime

from sqlalchemy.orm import Session

from ..models.database import Image, get_db
from .config import get_settings
from .storage import get_r2_client

settings = get_settings()
s3_client = get_r2_client()


async def sync_images():
    db = next(get_db())

    try:
        paginator = s3_client.get_paginator("list_objects_v2")

        # Get all keys from database
        db_keys = {img.key for img in db.query(Image.key).all()}
        r2_keys = set()

        for page in paginator.paginate(Bucket=settings.BUCKET_NAME):
            for obj in page.get("Contents", []):
                key = obj["Key"]
                r2_keys.add(key)

                if key not in db_keys:
                    # New image
                    image = Image(
                        key=key,
                        size=obj["Size"],
                        last_modified=obj["LastModified"],
                        url=f"https://{settings.BUCKET_ENDPOINT}/{key}",
                    )
                    db.add(image)
                else:
                    # Update existing image
                    db.query(Image).filter(Image.key == key).update(
                        {
                            "size": obj["Size"],
                            "last_modified": obj["LastModified"],
                            "updated_at": datetime.utcnow(),
                        }
                    )

        # Delete images that no longer exist in R2
        for key in db_keys - r2_keys:
            db.query(Image).filter(Image.key == key).delete()

        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


async def start_sync_task():
    """Run sync task on startup"""
    try:
        await sync_images()
    except Exception as e:
        print(f"Sync failed: {e}")
