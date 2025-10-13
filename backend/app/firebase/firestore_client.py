import os
import firebase_admin
from firebase_admin import credentials, firestore, storage # 1. Importar o módulo storage
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cred_path = os.getenv("FIREBASE_CREDENTIALS") or os.path.join(BASE_DIR, "firebase", "firebase_key.json")

BUCKET_NAME = os.getenv("FIREBASE_STORAGE_BUCKET")

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': BUCKET_NAME
    })

db = firestore.client()
bucket = storage.bucket()