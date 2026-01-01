import hashlib
import io
import os
from datetime import datetime
from typing import List, Optional

from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException, Query, Response, UploadFile
from PIL import Image as PILImage
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.storage import get_r2_client
from ..core.sync import sync_images
from ..models.database import Image, get_db
from ..models.image import ImageListResponse, ImageObject

router = APIRouter()
settings = get_settings()
# 在文件顶部初始化客户端
s3_client = get_r2_client()


@router.post("/sync")
async def sync_images_manually():
    """手动触发同步R2存储和数据库"""
    try:
        await sync_images()
        return {"message": "同步成功"}
    except Exception as e:
        print(f"Manual sync failed: {e}")


@router.get("/list", response_model=ImageListResponse)
async def list_images(
    page_size: int = Query(default=20, ge=1, le=50),  # limit page size
    page: int = Query(default=1, ge=1),  # 页码必须大于等于1
    db: Session = Depends(get_db),
):
    try:
        # 计算偏移量
        offset = (page - 1) * page_size

        # 查询总数
        total = db.query(Image).count()

        # 获取分页数据
        images = (
            db.query(Image)
            .order_by(Image.last_modified.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        # 计算是否有更多数据
        has_more = (offset + len(images)) < total

        return ImageListResponse(
            items=[
                ImageObject(
                    key=img.key,
                    last_modified=img.last_modified,
                    size=img.size,
                    url=img.url,
                    width=img.width,
                    height=img.height,
                )
                for img in images
            ],
            has_more=has_more,
            total=total,
            current_page=page,
        )
    except Exception as e:
        print(f"Error in list_images: {e}")  # 添加日志
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload", response_model=ImageObject)
async def upload_image(file: UploadFile, db: Session = Depends(get_db)):
    try:
        # Check file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")

        # Get file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
            raise HTTPException(status_code=400, detail="Unsupported image format")

        # Read file content
        content = await file.read()

        # Get image dimensions
        img = PILImage.open(io.BytesIO(content))
        width, height = img.size

        # Calculate MD5
        md5_hash = hashlib.md5(content).hexdigest()

        # Generate filename: timestamp_MD5.extension
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        file_name = f"{timestamp}_{md5_hash}{file_ext}"

        # Upload original image to R2
        s3_client.upload_fileobj(io.BytesIO(content), settings.BUCKET_NAME, file_name)

        # Get file metadata
        response = s3_client.head_object(Bucket=settings.BUCKET_NAME, Key=file_name)

        # Save to database with width and height
        image = Image(
            key=file_name,
            size=len(content),
            last_modified=response["LastModified"],
            url=f"https://{settings.BUCKET_ENDPOINT}/{file_name}",
            width=width,
            height=height,
        )
        db.add(image)
        db.commit()
        db.refresh(image)

        # Return upload result
        return ImageObject(
            key=image.key,
            last_modified=image.last_modified,
            size=image.size,
            url=image.url,
            width=image.width,
            height=image.height,
        )

    except Exception as e:
        print(f"Error in upload_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{key}")
async def download_image(key: str):
    try:
        try:
            response = s3_client.get_object(Bucket=settings.BUCKET_NAME, Key=key)
            return Response(
                content=response["Body"].read(), media_type=response["ContentType"]
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                raise HTTPException(status_code=404, detail="Image not found")
            raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Error in download_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{key}")
async def delete_image(key: str, db: Session = Depends(get_db)):
    try:
        # Delete image from R2
        s3_client.delete_object(Bucket=settings.BUCKET_NAME, Key=key)

        # Delete from database
        db_image = db.query(Image).filter(Image.key == key).first()
        if db_image:
            db.delete(db_image)
            db.commit()

        return {"message": "Image deleted successfully"}
    except Exception as e:
        print(f"Error in delete_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))
