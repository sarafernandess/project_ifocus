# app/repository/user_repository.py
from typing import Any, Dict, List, Optional
from app.firebase.firestore_client import db

COLLECTION = "users"

def get_user_by_uid(uid: str) -> Optional[Dict[str, Any]]:
    doc = db.collection(COLLECTION).document(uid).get()
    if not doc.exists:
        return None
    data = doc.to_dict() or {}
    data["uid"] = uid
    return data

def create_user(uid: str, payload: Dict[str, Any]) -> None:
    db.collection(COLLECTION).document(uid).set(payload)

def update_user(uid: str, payload: Dict[str, Any]) -> None:
    db.collection(COLLECTION).document(uid).update(payload)

def list_helpers_by_subject(subject: str) -> List[Dict[str, Any]]:
    q = db.collection(COLLECTION).where("helping_subjects", "array_contains", subject)
    docs = q.stream()
    out: List[Dict[str, Any]] = []
    for d in docs:
        u = d.to_dict() or {}
        out.append({
            "uid": u.get("uid", d.id),
            "name": u.get("name"),
            "email": u.get("email"),
            "avatarUrl": u.get("avatarUrl"),
            "helping_subjects": u.get("helping_subjects", []),
            # "helps": u.get("helps")  # se você adicionar no futuro
        })
    return out
