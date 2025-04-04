from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = "dev-secret-key"

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("email")
        is_admin = payload.get("is_admin", False)

        if not email:
            raise HTTPException(status_code=401, detail="Невалидный токен")

        return {
            "email": email,
            "is_admin": is_admin
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Токен истёк")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Невалидный токен")
