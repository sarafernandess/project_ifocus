from app.database.db import Db

def get_disciplines_for_course(course_id: str):
    return Db.list_subcollection("courses", course_id, "disciplines")

def get_discipline(course_id: str, discipline_id: str):
    return Db.get(f"courses/{course_id}/disciplines", discipline_id)

def create_discipline(course_id: str, discipline_id: str, data: dict):
    return Db.create(f"courses/{course_id}/disciplines", discipline_id, data)

def update_discipline(course_id: str, discipline_id: str, data: dict):
    return Db.update(f"courses/{course_id}/disciplines", discipline_id, data)

def delete_discipline(course_id: str, discipline_id: str):
    return Db.delete(f"courses/{course_id}/disciplines", discipline_id)
