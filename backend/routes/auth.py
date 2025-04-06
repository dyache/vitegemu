from fastapi import APIRouter, HTTPException, Form
from schemas import RegisterRequest, LoginRequest, TokenResponse
from db import get_connection
import bcrypt
import jwt
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY не найден в .env файле")

router = APIRouter(prefix="/auth", tags=["Аутентификация"])


@router.post("/register", response_model=TokenResponse)
def register(user: RegisterRequest):
    if not user.nickname:
        raise HTTPException(status_code=400, detail="Nickname обязателен при регистрации")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    hashed_pw = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode()

    cursor.execute(
        "INSERT INTO users (email, password, nickname, is_admin) VALUES (%s, %s, %s, %s)",
        (user.email, hashed_pw, user.nickname, user.is_admin)
    )
    conn.commit()

    token = jwt.encode(
        {"email": user.email, "is_admin": user.is_admin},
        SECRET_KEY,
        algorithm="HS256"
    )

    conn.close()
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
def login(
    username: str = Form(...),  
    password: str = Form(...)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (username,))
    db_user = cursor.fetchone()
    if not db_user:
        conn.close()
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    is_valid = bcrypt.checkpw(password.encode(), db_user["password"].encode())
    if not is_valid:
        conn.close()
        raise HTTPException(status_code=401, detail="Неверный пароль")

    token = jwt.encode(
        {"email": username, "is_admin": db_user["is_admin"]},
        SECRET_KEY,
        algorithm="HS256"
    )

    conn.close()
    return {"access_token": token, "token_type": "bearer"}


@router.post("/json-login", response_model=TokenResponse, summary="JSON login")
def login_json(user: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    db_user = cursor.fetchone()
    if not db_user:
        conn.close()
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    is_valid = bcrypt.checkpw(user.password.encode(), db_user["password"].encode())
    if not is_valid:
        conn.close()
        raise HTTPException(status_code=401, detail="Неверный пароль")

    token = jwt.encode(
        {"email": user.email, "is_admin": db_user["is_admin"]},
        SECRET_KEY,
        algorithm="HS256"
    )

    conn.close()
    return {"access_token": token, "token_type": "bearer"}
