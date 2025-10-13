from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from app.services.discipline_service import (
    add_discipline_to_course,
    get_discipline,
    update_discipline,
    delete_discipline,
    get_all_disciplines
)

router = APIRouter(prefix="/courses/{course_id}/disciplines", tags=["Disciplinas"])

@router.post("/{discipline_id}", status_code=status.HTTP_201_CREATED)
def add_discipline(course_id: str, discipline_id: str, name: str):
    add_discipline_to_course(course_id, discipline_id, name)
    return JSONResponse(status_code=201, content={"message": "Disciplina criada com sucesso", "data": {"id": discipline_id, "name": name}})

@router.get("/")
def get_disciplines(course_id: str):
    return get_all_disciplines(course_id)

@router.get("/{discipline_id}")
def get_discipline_by_id(course_id: str, discipline_id: str):
    discipline = get_discipline(course_id, discipline_id)
    if not discipline:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    return discipline

@router.put("/{discipline_id}")
def update_discipline_by_id(course_id: str, discipline_id: str, name: str):
    update_discipline(course_id, discipline_id, name)
    return JSONResponse(status_code=200, content={"message": "Disciplina atualizada com sucesso", "data": {"id": discipline_id, "name": name}})

@router.delete("/{discipline_id}")
def delete_discipline_by_id(course_id: str, discipline_id: str):
    delete_discipline(course_id, discipline_id)
    return JSONResponse(status_code=200, content={"message": "Disciplina removida com sucesso"})
