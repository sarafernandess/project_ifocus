from app.database.db import Db

def get_all_courses_raw():
    return Db.query("courses")

def get_course(course_id: str):
    return Db.get("courses", course_id)

def create_course(course_id: str, data: dict):
    return Db.create("courses", course_id, data)

def update_course(course_id: str, data: dict):
    return Db.update("courses", course_id, data)

def delete_course(course_id: str):
    return Db.delete("courses", course_id)