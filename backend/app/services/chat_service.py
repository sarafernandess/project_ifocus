from typing import Optional
from urllib.parse import unquote
from app.repository.chat_repository import chat_id_for, upsert_chat_meta, append_message
from app.firebase.firebase_storage import upload_file_from_bytes

def create_or_get_chat(current_uid: str, other_uid: str) -> str:
    cid = chat_id_for(current_uid, other_uid)
    # cria/atualiza metadados iniciais com snake_case + updated_at ms
    upsert_chat_meta(cid, [current_uid, other_uid], last_message=None, last_sender=None)
    return cid

def _kind_from(content_type: Optional[str], filename: Optional[str]) -> str:
    ct = (content_type or '').lower()
    name = (filename or '').lower()

    if ct.startswith('image/'):
        return 'Foto'
    if ct.startswith('video/') or ct.startswith('audio/'):
        return 'Mídia'
    # heurística por extensão (caso mimetype venha vazio)
    if any(name.endswith(ext) for ext in ('.jpg','.jpeg','.png','.gif','.bmp','.webp','.heic')):
        return 'Foto'
    if any(name.endswith(ext) for ext in ('.mp4','.mov','.mkv','.webm','.mp3','.wav','.m4a','.ogg')):
        return 'Mídia'
    return 'Arquivo'

def send_message_service(chat_id: str, sender_id: str, receiver_id: str, text: Optional[str],
                         file_bytes: Optional[bytes], filename: Optional[str], content_type: Optional[str]) -> str:
    file_url = None
    ftype = None
    fname = None

    if file_bytes and filename:
        clean_name = unquote(filename).replace('\\', '').replace('/', '')
        path = f"chats/{chat_id}/{clean_name}"
        file_url = upload_file_from_bytes(path, file_bytes, content_type or "application/octet-stream")
        ftype = (content_type or "application/octet-stream")
        fname = clean_name

    mid, _ = append_message(chat_id, sender_id, receiver_id, text, file_url, ftype, fname)

    if text and text.strip():
        preview = text.strip()[:120]
    elif file_url:
        preview = _kind_from(ftype, fname)
    else:
        preview = 'Mensagem'

    upsert_chat_meta(chat_id, [sender_id, receiver_id], preview, sender_id)
    return mid
