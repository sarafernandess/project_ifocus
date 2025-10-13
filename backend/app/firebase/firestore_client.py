import os
import firebase_admin
from firebase_admin import credentials, firestore, storage # 1. Importar o módulo storage
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURAÇÃO ---
# Caminho para a chave de serviço
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cred_path = os.getenv("FIREBASE_CREDENTIALS") or os.path.join(BASE_DIR, "firebase", "firebase_key.json")

# 2. Pegar o nome do bucket a partir do arquivo .env
BUCKET_NAME = os.getenv("FIREBASE_STORAGE_BUCKET")
# --- FIM DA CONFIGURAÇÃO ---


# 3. Inicializa o app apenas uma vez para evitar erros
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    # 4. Adiciona a configuração do storageBucket na inicialização
    firebase_admin.initialize_app(cred, {
        'storageBucket': BUCKET_NAME
    })

# 5. Cria e "exporta" as instâncias que seus outros arquivos usarão
db = firestore.client()
bucket = storage.bucket() # Cria a instância do bucket aqui