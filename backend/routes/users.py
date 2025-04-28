from fastapi import APIRouter, HTTPException, Depends
from db import get_connection
from utils.auth_utils import get_current_user
from typing import List
from schemas import UserOut

router = APIRouter(prefix="/users", tags=["Пользователи"])

@router.get("/", response_model=List[UserOut])
def get_all_users(current_user: dict = Depends(get_current_user)):
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Доступ только для админов")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, nickname, bio FROM users ORDER BY id")
    users = cursor.fetchall()
    conn.close()
    return users


@router.delete("/{email}")
def delete_user_by_email(email: str, current_user: dict = Depends(get_current_user)):
    if not current_user["is_admin"]:
        raise HTTPException(status_code=403, detail="Удаление доступно только администраторам")

    if current_user["email"] == email:
        raise HTTPException(status_code=403, detail="Нельзя удалить свой аккаунт таким способом")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    cursor.execute("DELETE FROM reviews WHERE nickname = (SELECT nickname FROM users WHERE email = %s)", (email,))

    cursor.execute("DELETE FROM users WHERE email = %s", (email,))
    conn.commit()
    conn.close()

    return {"message": f"Пользователь {email} удалён"}

@router.get("/profile/{nickname}", response_model=UserOut)
def get_user_profile(nickname: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, email, nickname, bio FROM users WHERE nickname = %s", (nickname,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return user
