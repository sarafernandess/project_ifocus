from typing import Optional
from firebase_admin import storage
from fastapi import UploadFile

def upload_file(file: UploadFile, destination_path: str) -> str:
    """
    Faz o upload do arquivo (UploadFile do FastAPI) para o Firebase Storage e retorna a URL pública.
    """
    bucket = storage.bucket()
    blob = bucket.blob(destination_path)

    file_data = file.file.read()
    blob.upload_from_string(file_data, content_type=file.content_type or "application/octet-stream")

    blob.make_public()
    return blob.public_url

def upload_file_from_bytes(destination_path: str, content: bytes, content_type: Optional[str] = None) -> str:
    """
    Faz upload a partir de bytes já lidos (útil quando a rota já fez await file.read()).
    """
    bucket = storage.bucket()
    blob = bucket.blob(destination_path)
    blob.upload_from_string(content, content_type=content_type or "application/octet-stream")
    blob.make_public()
    return blob.public_url
