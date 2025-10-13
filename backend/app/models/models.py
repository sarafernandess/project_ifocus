from datetime import datetime

from pydantic import BaseModel
from typing import List, Optional


class DisciplineModel(BaseModel):
    id: str
    name: str

class CourseModel(BaseModel):
    id: str
    name: str
    disciplines: List[DisciplineModel]

class ChatMessageModel(BaseModel):
    sender_id: str
    receiver_id: str
    message: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None  # <- novo campo
    timestamp: Optional[str] = None

class ChatResponseModel(ChatMessageModel):
    timestamp: datetime