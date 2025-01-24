from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ImageObject(BaseModel):
    key: str
    last_modified: datetime
    size: int
    url: str
    thumbnail_url: Optional[str] = None

class ImageListResponse(BaseModel):
    items: List[ImageObject]
    has_more: bool
    total: int
    current_page: int 