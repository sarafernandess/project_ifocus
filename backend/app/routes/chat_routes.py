from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from typing import Optional, List
from app.auth.auth import get_current_user
from app.models.chat_models import CreateChatRequest, ChatMeta, SendMessageResponse, MessageDTO
from app.services.chat_service import create_or_get_chat, send_message_service
from app.repository.chat_repository import list_user_chats, list_messages

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/create", response_model=str)
def create_chat(req: CreateChatRequest, user=Depends(get_current_user)):
    uid = user["uid"]
    other = req.other_user_id
    if not other or other == uid:
        raise HTTPException(status_code=400, detail="other_user_id inválido")
    return create_or_get_chat(uid, other)

@router.get("/user/{user_id}", response_model=List[ChatMeta])
def user_chats(user_id: str, user=Depends(get_current_user)):
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    items = list_user_chats(user_id)
    return [ChatMeta(**{
        "id": i["id"],
        "participants": i["participants"],
        "last_message": i.get("last_message"),
        "last_sender": i.get("last_sender"),
        "updated_at": i.get("updated_at", 0),
    }) for i in items]

@router.get("/messages/{chat_id}", response_model=List[MessageDTO])
def get_messages(chat_id: str, limit: int = Query(20, ge=1, le=50), before: Optional[int] = Query(None), user=Depends(get_current_user)):
    items = list_messages(chat_id, limit=limit, before_ts=before)
    return [MessageDTO(**i) for i in items]

@router.post("/send/{chat_id}", response_model=SendMessageResponse)
async def send_message(
    chat_id: str,
    receiver_id: str = Form(...),
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    user=Depends(get_current_user)
):
    file_bytes = None
    filename = None
    content_type = None
    if file:
        file_bytes = await file.read()
        filename = file.filename
        content_type = file.content_type
    mid = send_message_service(chat_id, user["uid"], receiver_id, text, file_bytes, filename, content_type)
    return {"message_id": mid, "chat_id": chat_id}
