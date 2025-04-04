from fastapi import APIRouter, Depends, HTTPException, Body
from db import get_connection
from utils.auth_utils import get_current_user
from schemas import ProfileUpdate

router = APIRouter(prefix="/profile", tags=["Профиль"])


@router.get("/", summary="Get current logged profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    email = current_user["email"]

    cursor.execute("SELECT id, email, nickname, bio FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    cursor.execute(
        "SELECT id, title, content, nickname FROM reviews WHERE nickname = %s ORDER BY id DESC",
        (user["nickname"],)
    )
    reviews = cursor.fetchall()

    conn.close()

    return {
        "user": user,
        "reviews": reviews
    }


@router.patch("/", summary="Update profile")
def update_profile(
    data: ProfileUpdate = Body(...),
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE users SET nickname = %s, bio = %s WHERE email = %s",
        (data.nickname, data.bio, current_user["email"])
    )

    conn.commit()
    conn.close()
    return {"message": "Профиль обновлён"}
