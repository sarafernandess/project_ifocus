from typing import Optional, List
from pydantic import BaseModel, Field

class CreateChatRequest(BaseModel):
    other_user_id: str

class ChatMeta(BaseModel):
    id: str
    participants: List[str]
    last_message: Optional[str] = None
    last_sender: Optional[str] = None
    updated_at: Optional[int] = None

class SendMessageResponse(BaseModel):
    message_id: str
    chat_id: str

class MessageDTO(BaseModel):
    id: str
    chat_id: str
    sender_id: str
    receiver_id: str
    message: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    file_name: Optional[str] = None
    timestamp: int
