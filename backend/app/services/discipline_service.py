from app.repository import discipline_repository

def add_discipline_to_course(course_id: str, discipline_id: str, name: str):
    return discipline_repository.create_discipline(course_id, discipline_id, {"id": discipline_id, "name": name})

def get_discipline(course_id: str, discipline_id: str):
    return discipline_repository.get_discipline(course_id, discipline_id)

def get_all_disciplines(course_id: str):
    return discipline_repository.get_disciplines_for_course(course_id)

def update_discipline(course_id: str, discipline_id: str, name: str):
    return discipline_repository.update_discipline(course_id, discipline_id, {"name": name})

def delete_discipline(course_id: str, discipline_id: str):
    return discipline_repository.delete_discipline(course_id, discipline_id)
