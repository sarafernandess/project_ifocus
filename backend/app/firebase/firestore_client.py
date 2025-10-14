import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv

load_dotenv()

def _resolve_credentials():
    """
    Resolve credenciais do Firebase na seguinte ordem:
    1) FIREBASE_CREDENTIALS (conteúdo JSON da service account)
    2) FIREBASE_CREDENTIALS (caminho do arquivo, se existir)
    3) GOOGLE_APPLICATION_CREDENTIALS (caminho do arquivo, se existir)
    4) app/firebase/firebase_key.json (fallback local, se existir)
    """
    # 1) JSON bruto na env
    raw = os.getenv("FIREBASE_CREDENTIALS")
    if raw:
        raw = raw.strip()
        # Se for JSON (começa com {)
        if raw.startswith("{"):
            try:
                data = json.loads(raw)
                return credentials.Certificate(data)
            except Exception as e:
                raise RuntimeError(f"FIREBASE_CREDENTIALS inválido (JSON): {e}")
        # Se não parece JSON, tenta como caminho
        if os.path.exists(raw):
            return credentials.Certificate(raw)
        else:
            raise RuntimeError(
                "FIREBASE_CREDENTIALS definido, mas não é JSON nem um arquivo existente."
            )

    # 2) GOOGLE_APPLICATION_CREDENTIALS (caminho para arquivo secreto)
    gac = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if gac and os.path.exists(gac):
        return credentials.Certificate(gac)

    # 3) fallback local (dev): app/firebase/firebase_key.json
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    local_path = os.path.join(base_dir, "firebase", "firebase_key.json")
    if os.path.exists(local_path):
        return credentials.Certificate(local_path)

    raise RuntimeError(
        "Credenciais do Firebase ausentes. "
        "Defina FIREBASE_CREDENTIALS (JSON ou caminho), ou GOOGLE_APPLICATION_CREDENTIALS (caminho)."
    )

def _firebase_options():
    """
    Define opções opcionais, como o bucket do Storage.
    """
    opts = {}
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")  # ex.: my-app-ifocus.appspot.com
    if bucket_name:
        opts["storageBucket"] = bucket_name
    return opts or None

# Inicializa o app Firebase apenas uma vez
if not firebase_admin._apps:
    cred = _resolve_credentials()
    options = _firebase_options()
    firebase_admin.initialize_app(cred, options)

db = firestore.client()
bucket = storage.bucket()
