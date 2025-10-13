from app.models.models import CourseModel, DisciplineModel
from app.repository import course_repository, discipline_repository

def list_courses_with_disciplines() -> list[CourseModel]:
    raw_courses = course_repository.get_all_courses_raw()
    result = []
    for c in raw_courses:
        disciplines_raw = discipline_repository.get_disciplines_for_course(c["id"])
        disciplines = [DisciplineModel(**d) for d in disciplines_raw]
        result.append(CourseModel(id=c["id"], name=c["name"], disciplines=disciplines))
    return result

def create_new_course(course_id: str, name: str):
    return course_repository.create_course(course_id, {"id": course_id, "name": name})

def get_course_by_id(course_id: str):
    return course_repository.get_course(course_id)

def update_course_by_id(course_id: str, name: str):
    return course_repository.update_course(course_id, {"name": name})

def delete_course_by_id(course_id: str):
    return course_repository.delete_course(course_id)
