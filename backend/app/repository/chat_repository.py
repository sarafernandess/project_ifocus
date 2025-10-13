import time, uuid
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from google.cloud import firestore
from app.firebase.firestore_client import db

def _now_ms() -> int:
    return int(time.time() * 1000)

def _to_ms(v: Any) -> Optional[int]:
    """Normaliza timestamp (SERVER_TIMESTAMP/datetime/float/int) para epoch ms."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return int(v)
    try:
        # Firestore Timestamp e datetime têm .timestamp()
        return int(v.timestamp() * 1000)
    except Exception:
        return None

def chat_id_for(u1: str, u2: str) -> str:
    a, b = sorted([u1, u2])
    return f"{a}_{b}"

def upsert_chat_meta(chat_id: str, participants: List[str],
                     last_message: Optional[str], last_sender: Optional[str]) -> None:
    """
    Grava metadados do chat em SNAKE_CASE e com updated_at em epoch ms.
    Mantemos também os campos camelCase para compatibilidade (migração suave).
    """
    now = _now_ms()
    meta_snake = {
        "id": chat_id,
        "participants": participants,
        "last_message": last_message,
        "last_sender": last_sender,
        "updated_at": now,
    }

    meta_camel = {
        "lastMessage": last_message,
        "lastSender": last_sender,
        "updatedAt": now,
    }
    db.collection("chats").document(chat_id).set({**meta_snake, **meta_camel}, merge=True)

def _kind_from(content_type: Optional[str], filename: Optional[str]) -> str:
    ct = (content_type or '').lower()
    name = (filename or '').lower()
    if ct.startswith('image/'): return 'Foto'
    if ct.startswith('video/') or ct.startswith('audio/'): return 'Mídia'
    if any(name.endswith(ext) for ext in ('.jpg','.jpeg','.png','.gif','.bmp','.webp','.heic')): return 'Foto'
    if any(name.endswith(ext) for ext in ('.mp4','.mov','.mkv','.webm','.mp3','.wav','.m4a','.ogg')): return 'Mídia'
    return 'Arquivo'

def list_user_chats(uid: str) -> List[Dict[str, Any]]:
    qs = db.collection("chats").where("participants", "array_contains", uid).stream()

    items: List[Dict[str, Any]] = []
    for d in qs:
        c = d.to_dict() or {}

        # lê snake ou camel
        last_message = c.get("last_message", c.get("lastMessage"))
        last_sender  = c.get("last_sender",  c.get("lastSender"))
        updated_at   = c.get("updated_at",   c.get("updatedAt"))

        if not last_message:
            try:
                last_q = db.collection("chats").document(d.id)\
                           .collection("messages")\
                           .order_by("timestamp", direction=firestore.Query.DESCENDING)\
                           .limit(1).stream()
                last_docs = list(last_q)
                if last_docs:
                    mm = last_docs[0].to_dict() or {}
                    ts_ms = _to_ms(mm.get("timestamp")) or 0
                    if (mm.get("message") or "").strip():
                        last_message = (mm.get("message") or "").strip()
                    elif mm.get("file_url"):
                        last_message = _kind_from(mm.get("file_type"), mm.get("file_name"))
                    else:
                        last_message = "Mensagem"
                    updated_at = updated_at or ts_ms

                    db.collection("chats").document(d.id).set({
                        "last_message": last_message,
                        "last_sender": mm.get("sender_id"),
                        "updated_at": updated_at,
                        "lastMessage": last_message,
                        "lastSender": mm.get("sender_id"),
                        "updatedAt": updated_at,
                    }, merge=True)
            except Exception:
                pass

        items.append({
            "id": c.get("id", d.id),
            "participants": c.get("participants", []),
            "last_message": last_message,
            "last_sender": last_sender,
            "updated_at": _to_ms(updated_at) or 0,
        })

    items.sort(key=lambda x: x.get("updated_at") or 0, reverse=True)
    return items

def append_message(chat_id: str, sender_id: str, receiver_id: str, message: Optional[str],
                   file_url: Optional[str], file_type: Optional[str], file_name: Optional[str]) -> Tuple[str, int]:
    mid = str(uuid.uuid4())
    ref = db.collection("chats").document(chat_id).collection("messages").document(mid)
    payload = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "message": message,
        "file_url": file_url,
        "file_type": file_type,
        "file_name": file_name,
        "timestamp": firestore.SERVER_TIMESTAMP,
    }
    ref.set(payload)
    return mid, _now_ms()

def list_messages(chat_id: str, limit: int, before_ts: Optional[int]) -> List[Dict]:
    col = db.collection("chats").document(chat_id).collection("messages")
    q = col.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit)
    docs = list(q.stream())

    items: List[Dict[str, Any]] = []
    for d in docs:
        m = d.to_dict() or {}
        ts_ms = _to_ms(m.get("timestamp")) or 0
        items.append({
            "id": d.id,
            "chat_id": chat_id,
            "sender_id": m.get("sender_id"),
            "receiver_id": m.get("receiver_id"),
            "message": m.get("message"),
            "file_url": m.get("file_url"),
            "file_type": m.get("file_type"),
            "file_name": m.get("file_name"),
            "timestamp": ts_ms,
        })

    items.sort(key=lambda x: x["timestamp"])
    if before_ts:
        items = [i for i in items if i["timestamp"] and i["timestamp"] < before_ts]
    return items
