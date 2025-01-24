import boto3
from botocore.config import Config
from .config import get_settings
from PIL import Image
import io
from typing import Tuple

settings = get_settings()

def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=f"https://{settings.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.CLOUDFLARE_ACCESS_KEY_ID,
        aws_secret_access_key=settings.CLOUDFLARE_SECRET_ACCESS_KEY,
        region_name='auto',
        config=Config(
            signature_version='s3v4',
            retries={
                'max_attempts': 3,
                'mode': 'standard'
            }
        )
    )

def create_thumbnail(image_data: bytes, max_size: Tuple[int, int] = (300, 300)) -> bytes:
    """
    创建缩略图
    :param image_data: 原始图片数据
    :param max_size: 缩略图最大尺寸 (宽, 高)
    :return: 缩略图数据
    """
    try:
        img = Image.open(io.BytesIO(image_data))
        
        # 转换为RGB模式（处理RGBA图片）
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1])
            img = background
        elif img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        
        # 保持宽高比缩放
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # 保存为JPEG格式
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        return output.getvalue()
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        raise