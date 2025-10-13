from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from app.services.course_service import (
    list_courses_with_disciplines,
    create_new_course,
    get_course_by_id,
    update_course_by_id,
    delete_course_by_id
)
from app.models.models import CourseModel

router = APIRouter(prefix="/courses", tags=["Cursos"])

@router.get("/", response_model=list[CourseModel])
def get_courses():
    return list_courses_with_disciplines()

@router.get("/{course_id}")
def get_course(course_id: str):
    course = get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    return course

@router.post("/{course_id}", status_code=status.HTTP_201_CREATED)
def create_course(course_id: str, name: str):
    create_new_course(course_id, name)
    return JSONResponse(status_code=201, content={"message": "Curso criado com sucesso", "data": {"id": course_id, "name": name}})

@router.put("/{course_id}")
def update_course(course_id: str, name: str):
    update_course_by_id(course_id, name)
    return JSONResponse(status_code=200, content={"message": "Curso atualizado com sucesso", "data": {"id": course_id, "name": name}})

@router.delete("/{course_id}")
def delete_course(course_id: str):
    delete_course_by_id(course_id)
    return JSONResponse(status_code=200, content={"message": "Curso removido com sucesso"})
