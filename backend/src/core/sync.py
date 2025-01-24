from ..models.database import Image, get_db
from .storage import get_r2_client, create_thumbnail
from .config import get_settings
from sqlalchemy.orm import Session
from datetime import datetime
import asyncio
import io
import requests

settings = get_settings()

async def generate_thumbnail_if_missing(key: str) -> str:
    """为指定的图片生成缩略图（如果不存在）"""
    thumbnail_key = f"thumb_{key}"
    try:
        # 为每次操作创建新的客户端实例
        s3_client = get_r2_client()
        
        # 检查缩略图是否存在
        s3_client.head_object(Bucket=settings.BUCKET_NAME, Key=thumbnail_key)
        return f"https://{settings.BUCKET_ENDPOINT}/{thumbnail_key}"
    except:
        try:
            # 重新创建客户端实例用于获取原图
            s3_client = get_r2_client()
            # 获取原图
            response = s3_client.get_object(Bucket=settings.BUCKET_NAME, Key=key)
            image_data = response['Body'].read()
            
            # 生成缩略图
            thumbnail_data = create_thumbnail(image_data)
            
            # 重新创建客户端实例用于上传缩略图
            s3_client = get_r2_client()
            # 上传缩略图
            s3_client.put_object(
                Bucket=settings.BUCKET_NAME,
                Key=thumbnail_key,
                Body=thumbnail_data,
                ContentType='image/jpeg'
            )
            
            return f"https://{settings.BUCKET_ENDPOINT}/{thumbnail_key}"
        except Exception as e:
            print(f"Error generating thumbnail for {key}: {e}")
            return None

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
                # 跳过缩略图
                if key.startswith('thumb_'):
                    continue
                    
                r2_keys.add(key)
                
                # 生成或获取缩略图URL
                thumbnail_url = await generate_thumbnail_if_missing(key)
                
                if key not in db_keys:
                    # 新增的图片
                    image = Image(
                        key=key,
                        size=obj['Size'],
                        last_modified=obj['LastModified'],
                        url=f"https://{settings.BUCKET_ENDPOINT}/{key}",
                        thumbnail_url=thumbnail_url
                    )
                    db.add(image)
                else:
                    # 更新已存在的图片
                    update_data = {
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'],
                        'updated_at': datetime.utcnow()
                    }
                    if thumbnail_url:  # 只在成功生成缩略图时更新URL
                        update_data['thumbnail_url'] = thumbnail_url
                    
                    db.query(Image).filter(Image.key == key).update(update_data)
        
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
    """启动时执行一次同步任务"""
    try:
        await sync_images()
    except Exception as e:
        print(f"Sync failed: {e}")