from google.cloud.exceptions import NotFound
from app.firebase.firestore_client import db

class Db:
    _db = db

    @staticmethod
    def create(collection: str, doc_id: str, data: dict):
        try:
            return Db._db.collection(collection).document(doc_id).set(data)
        except Exception as e:
            print(f"[Db.create] Erro ao criar documento: {e}")
            raise

    @staticmethod
    def get(collection: str, doc_id: str):
        try:
            doc = Db._db.collection(collection).document(doc_id).get()
            return doc.to_dict() if doc.exists else None
        except NotFound:
            return None
        except Exception as e:
            print(f"[Db.get] Erro ao buscar documento: {e}")
            raise

    @staticmethod
    def update(collection: str, doc_id: str, data: dict):
        try:
            return Db._db.collection(collection).document(doc_id).update(data)
        except Exception as e:
            print(f"[Db.update] Erro ao atualizar documento: {e}")
            raise

    @staticmethod
    def delete(collection: str, doc_id: str):
        try:
            return Db._db.collection(collection).document(doc_id).delete()
        except Exception as e:
            print(f"[Db.delete] Erro ao deletar documento: {e}")
            raise

    @staticmethod
    def query(collection: str, filters: list[tuple] = []):
        try:
            col_ref = Db._db.collection(collection)
            for field, op, value in filters:
                col_ref = col_ref.where(field, op, value)
            return [doc.to_dict() for doc in col_ref.stream()]
        except Exception as e:
            print(f"[Db.query] Erro ao realizar consulta: {e}")
            raise

    @staticmethod
    def list_subcollection(collection: str, doc_id: str, subcollection: str):
        try:
            sub_ref = Db._db.collection(collection).document(doc_id).collection(subcollection)
            return [doc.to_dict() for doc in sub_ref.stream()]
        except Exception as e:
            print(f"[Db.list_subcollection] Erro ao listar subcoleção: {e}")
            raise
