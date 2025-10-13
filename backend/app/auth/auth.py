# Em um arquivo de autenticação, ex: auth_handler.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from firebase_admin import auth

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # O token virá com "Bearer " na frente, mas o Depends já extrai o valor puro.
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        # Se o token for inválido ou expirado, levanta um erro 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )