# app/services/user_service.py
import base64
import uuid
import re
from typing import Any, Dict, List, Optional, Tuple

from google.cloud import firestore
from app.firebase.firestore_client import storage
from app.repository.user_repository import (
    get_user_by_uid,
    create_user,
    update_user,
    list_helpers_by_subject,
)

INSTITUTIONAL_EMAIL_REGEX = r".+@.+\.edu\.br$"

def validate_institutional_email(email: str) -> bool:
    return bool(re.match(INSTITUTIONAL_EMAIL_REGEX, email or ""))

def build_new_user(uid: str, email: str, name: str) -> Dict[str, Any]:
    return {
        "uid": uid,
        "email": email,
        "name": name,
        "helping_subjects": [],
        "avatar": name[0].upper() if name else "?",
        "created_at": firestore.SERVER_TIMESTAMP,
    }

def create_profile(uid: str, email: str, name: str) -> Dict[str, Any]:
    if not validate_institutional_email(email):
        raise ValueError("Cadastro permitido apenas com e-mail institucional (.edu.br)")
    existing = get_user_by_uid(uid)
    if existing:
        raise FileExistsError("Perfil de usuário já existe")
    payload = build_new_user(uid, email, name)
    create_user(uid, payload)
    return {"message": "Perfil de usuário criado com sucesso", "uid": uid}

def get_me(uid: str) -> Dict[str, Any]:
    user = get_user_by_uid(uid)
    if not user:
        raise LookupError("Perfil de usuário não encontrado")
    return user

def upload_avatar_from_base64(uid: str, data_url: str) -> str:
    """
    Recebe um data URL (ex.: 'data:image/jpeg;base64,...'), envia ao Firebase Storage
    e retorna a URL pública.
    """
    header, encoded = data_url.split(",", 1)
    mime_type = header.split(":", 1)[1].split(";", 1)[0]
    image_data = base64.b64decode(encoded)

    bucket = storage.bucket()
    file_name = f"profile_pictures/{uid}/{uuid.uuid4()}.jpg"
    blob = bucket.blob(file_name)
    blob.upload_from_string(image_data, content_type=mime_type)
    blob.make_public()
    return blob.public_url

def update_me(uid: str, update_payload: Dict[str, Any]) -> Dict[str, Any]:
    payload = {k: v for k, v in (update_payload or {}).items() if v is not None}

    # avatar base64 -> Storage
    avatar_field = payload.pop("avatarImageBase64", None)
    if avatar_field:
        url = upload_avatar_from_base64(uid, avatar_field)
        payload["avatarUrl"] = url

    if not payload:
        raise ValueError("Nenhum dado fornecido para atualização")

    update_user(uid, payload)
    return get_me(uid)

# app/services/user_service.py
def get_helpers(subject: str, requester_uid: str) -> List[Dict[str, Any]]:
    helpers = list_helpers_by_subject(subject)
    # 🔒 remove o próprio usuário
    return [h for h in helpers if str(h.get("uid")) != str(requester_uid)]

