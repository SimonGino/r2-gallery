from fastapi import APIRouter, HTTPException, UploadFile, Depends, Query
from typing import List, Optional
from ..core.storage import get_r2_client
from ..models.image import ImageObject, ImageListResponse
from ..core.config import get_settings
from botocore.exceptions import ClientError
from sqlalchemy.orm import Session
from ..models.database import get_db, Image
from datetime import datetime
import hashlib
import aiofiles
import os
from tempfile import NamedTemporaryFile

router = APIRouter()
settings = get_settings()

@router.get("/list", response_model=ImageListResponse)
async def list_images(
    page_size: int = Query(default=10, ge=1, le=50),  # 限制页面大小
    page: int = Query(default=1, ge=1),  # 页码必须大于等于1
    db: Session = Depends(get_db)
):
    try:
        # 计算偏移量
        offset = (page - 1) * page_size
        
        # 查询总数
        total = db.query(Image).count()
        
        # 获取分页数据
        images = db.query(Image)\
            .order_by(Image.last_modified.desc())\
            .offset(offset)\
            .limit(page_size)\
            .all()

        # 计算是否有更多数据
        has_more = (offset + len(images)) < total
        
        return ImageListResponse(
            items=[
                ImageObject(
                    key=img.key,
                    last_modified=img.last_modified,
                    size=img.size,
                    url=img.url
                ) for img in images
            ],
            has_more=has_more,
            total=total,
            current_page=page
        )
    except Exception as e:
        print(f"Error in list_images: {e}")  # 添加日志
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=ImageObject)
async def upload_image(
    file: UploadFile,
    db: Session = Depends(get_db)
):
    try:
        # 检查文件类型
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")

        # 获取文件扩展名
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            raise HTTPException(status_code=400, detail="Unsupported image format")

        # 创建临时文件以计算MD5
        with NamedTemporaryFile(delete=False) as temp_file:
            # 读取上传的文件内容
            content = await file.read()
            # 写入临时文件
            temp_file.write(content)
            temp_file.flush()

            # 计算MD5
            md5_hash = hashlib.md5()
            with open(temp_file.name, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    md5_hash.update(chunk)
            
            # 生成文件名：时间戳_MD5值.扩展名
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            file_name = f"{timestamp}_{md5_hash.hexdigest()}{file_ext}"

            # 上传到R2
            s3_client = get_r2_client()
            s3_client.put_object(
                Bucket=settings.BUCKET_NAME,
                Key=file_name,
                Body=content,
                ContentType=file.content_type
            )

            # 获取文件信息
            response = s3_client.head_object(
                Bucket=settings.BUCKET_NAME,
                Key=file_name
            )

            # 保存到数据库
            image = Image(
                key=file_name,
                size=len(content),
                last_modified=response['LastModified'],
                url=f"https://{settings.BUCKET_ENDPOINT}/{file_name}"
            )
            db.add(image)
            db.commit()
            db.refresh(image)

            # 删除临时文件
            os.unlink(temp_file.name)

            # 返回上传结果
            return ImageObject(
                key=image.key,
                last_modified=image.last_modified,
                size=image.size,
                url=image.url
            )

    except Exception as e:
        # 确保清理临时文件
        if 'temp_file' in locals():
            try:
                os.unlink(temp_file.name)
            except:
                pass
        print(f"Error in upload_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{key}")
async def delete_image(
    key: str,
    db: Session = Depends(get_db)
):
    try:
        # 从R2删除
        s3_client = get_r2_client()
        s3_client.delete_object(
            Bucket=settings.BUCKET_NAME,
            Key=key
        )

        # 从数据库删除
        db_image = db.query(Image).filter(Image.key == key).first()
        if db_image:
            db.delete(db_image)
            db.commit()

        return {"message": "Image deleted successfully"}
    except Exception as e:
        print(f"Error in delete_image: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 