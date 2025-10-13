from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.firebase.firestore_client import db
from app.auth.auth import get_current_user
from app.services.user_service import (
    create_profile,
    get_me,
    update_me,
    get_helpers,
)

router = APIRouter(prefix="/user", tags=["Usuários"])

helpers_router = APIRouter(prefix="/users", tags=["Usuários"])

public_router = APIRouter(prefix="/users", tags=["Usuários"])

class UserCreate(BaseModel):
    name: str = Field(..., min_length=3, description="Nome completo do usuário")

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3)
    helping_subjects: Optional[List[str]] = None
    avatarImageBase64: Optional[str] = None

@router.post("/create", status_code=status.HTTP_201_CREATED, summary="Cria o perfil de um novo usuário no Firestore")
async def create_user_profile(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    try:
        return create_profile(
            uid=current_user.get("uid"),
            email=current_user.get("email"),
            name=user_data.name,
        )
    except FileExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.get("/me", summary="Obtém o perfil do usuário autenticado")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    try:
        return get_me(current_user.get("uid"))
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.put("/me", summary="Atualiza o perfil do usuário autenticado")
async def update_my_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    try:
        updated = update_me(current_user.get("uid"), update_data.dict(exclude_unset=True))
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar perfil: {e}")

@router.get("/helpers", summary="Lista estudantes que ajudam na disciplina informada (alias)")
async def list_helpers_by_subject_alias(
    subject: str = Query(..., min_length=1, description="Nome da disciplina"),
    current_user: dict = Depends(get_current_user),
):
    return get_helpers(subject, current_user.get("uid"))

@helpers_router.get("/helpers", summary="Lista estudantes que ajudam na disciplina informada")
async def list_helpers_by_subject(
    subject: str = Query(..., min_length=1, description="Nome da disciplina"),
    current_user: dict = Depends(get_current_user),
):
    return get_helpers(subject, current_user.get("uid"))

@public_router.get("/public", summary="Retorna nome/avatar públicos por lista de UIDs")
async def get_public_users(
    uids: str = Query(..., description="Lista de UIDs separados por vírgula"),
    _: dict = Depends(get_current_user),
):
    """
    Exemplo: /users/public?uids=uidA,uidB,uidC
    Retorna: [{ uid, name, avatarUrl }]
    """
    raw = [u.strip() for u in (uids or "").split(",") if u.strip()]
    if not raw:
        return []

    users = []
    for uid in raw:
        doc = db.collection("users").document(uid).get()
        if doc.exists:
            d = doc.to_dict() or {}
            users.append({
                "uid": uid,
                "name": d.get("name"),
                "avatarUrl": d.get("avatarUrl"),
            })
    return users

