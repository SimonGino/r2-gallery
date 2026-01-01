from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ImageObject(BaseModel):
    key: str
    last_modified: datetime
    size: int
    url: str
    width: Optional[int] = None  # Image width in pixels
    height: Optional[int] = None  # Image height in pixels


class ImageListResponse(BaseModel):
    items: List[ImageObject]
    has_more: bool
    total: int
    current_page: int
