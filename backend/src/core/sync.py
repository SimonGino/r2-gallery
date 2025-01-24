from ..models.database import Image, get_db
from .storage import get_r2_client
from .config import get_settings
from sqlalchemy.orm import Session
from datetime import datetime
import asyncio

settings = get_settings()

async def sync_images():
    """同步R2中的图片到数据库"""
    s3_client = get_r2_client()
    db = next(get_db())
    
    try:
        paginator = s3_client.get_paginator('list_objects_v2')
        
        # 获取数据库中所有的key
        db_keys = {img.key for img in db.query(Image.key).all()}
        r2_keys = set()
        
        for page in paginator.paginate(Bucket=settings.BUCKET_NAME):
            for obj in page.get('Contents', []):
                key = obj['Key']
                r2_keys.add(key)
                
                if key not in db_keys:
                    # 新增的图片
                    image = Image(
                        key=key,
                        size=obj['Size'],
                        last_modified=obj['LastModified'],
                        url=f"https://{settings.BUCKET_ENDPOINT}/{key}"
                    )
                    db.add(image)
                else:
                    # 更新已存在的图片
                    db.query(Image).filter(Image.key == key).update({
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'],
                        'updated_at': datetime.utcnow()
                    })
        
        # 删除不存在的图片
        for key in db_keys - r2_keys:
            db.query(Image).filter(Image.key == key).delete()
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

async def start_sync_task():
    """启动定期同步任务"""
    while True:
        try:
            await sync_images()
        except Exception as e:
            print(f"Sync failed: {e}")
        await asyncio.sleep(300)  # 每5分钟同步一次 