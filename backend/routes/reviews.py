from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from schemas import ReviewOut, ReviewUpdate
from db import get_connection
from utils.auth_utils import get_current_user
import os
import shutil

router = APIRouter(prefix="/reviews", tags=["Обзоры"])

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/{review_id}", response_model=ReviewOut)
def get_review(review_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, nickname, created_at, images FROM reviews WHERE id = %s", (review_id,))
    review = cursor.fetchone()
    conn.close()

    if not review:
        raise HTTPException(status_code=404, detail="Обзор не найден")

    if review["nickname"] is None:
        review["nickname"] = "Аноним"

    return review

@router.get("/", response_model=List[ReviewOut])
def get_reviews():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, nickname, created_at, images FROM reviews ORDER BY id DESC")
    reviews = cursor.fetchall()

    for r in reviews:
        if r["nickname"] is None:
            r["nickname"] = "Аноним"

    conn.close()
    return reviews

from fastapi import UploadFile, File, Form, HTTPException, Depends
from typing import List, Optional
import os
import uuid
from db import get_connection
from utils.auth_utils import get_current_user

UPLOAD_DIR = "uploaded_images"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_MB = 5

@router.post("/", response_model=ReviewOut)
async def create_review(
    title: str = Form(...),
    content: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT nickname FROM users WHERE email = %s", (current_user["email"],))
    user_data = cursor.fetchone()

    if not user_data:
        conn.close()
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    nickname = user_data["nickname"] or "Аноним"

    saved_image_paths = []

    if images:
        for image in images:
            extension = os.path.splitext(image.filename)[1].lower()

            if extension not in ALLOWED_EXTENSIONS:
                conn.close()
                raise HTTPException(status_code=400, detail="Недопустимый формат файла")

            contents = await image.read()
            size_mb = len(contents) / (1024 * 1024)

            if size_mb > MAX_FILE_SIZE_MB:
                conn.close()
                raise HTTPException(status_code=400, detail="Файл слишком большой (макс. 5 МБ)")

            unique_filename = f"{uuid.uuid4().hex}{extension}"
            file_location = os.path.join(UPLOAD_DIR, unique_filename)

            with open(file_location, "wb") as f:
                f.write(contents)

            saved_image_paths.append(file_location)

    cursor.execute(
        """
        INSERT INTO reviews (title, content, nickname, created_at, images)
        VALUES (%s, %s, %s, NOW(), %s)
        RETURNING id, created_at
        """,
        (title, content, nickname, saved_image_paths if saved_image_paths else None)
    )

    result = cursor.fetchone()

    if not result:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail="Ошибка при создании обзора")

    conn.commit()
    conn.close()

    return {
        "id": result["id"],
        "title": title,
        "content": content,
        "nickname": nickname,
        "created_at": result["created_at"].isoformat(),
        "images": saved_image_paths
    }


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT nickname FROM users WHERE email = %s", (current_user["email"],))
    user_data = cursor.fetchone()
    if not user_data:
        conn.close()
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user_nickname = user_data["nickname"]

    cursor.execute("SELECT nickname FROM reviews WHERE id = %s", (review_id,))
    review = cursor.fetchone()
    if not review:
        conn.close()
        raise HTTPException(status_code=404, detail="Обзор не найден")

    if review["nickname"] != user_nickname and not current_user.get("is_admin"):
        conn.close()
        raise HTTPException(status_code=403, detail="Вы не автор этого обзора")

    cursor.execute("DELETE FROM reviews WHERE id = %s", (review_id,))
    conn.commit()
    conn.close()

    return {"message": f"Обзор {review_id} удалён"}

@router.patch("/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM reviews WHERE id = %s", (review_id,))
    review = cursor.fetchone()

    if not review:
        conn.close()
        raise HTTPException(status_code=404, detail="Обзор не найден")

    cursor.execute("SELECT nickname FROM users WHERE email = %s", (current_user["email"],))
    user = cursor.fetchone()

    if not user or review["nickname"] != user["nickname"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Вы не автор этого обзора")

    new_title = data.title if data.title else review["title"]
    new_content = data.content if data.content else review["content"]

    cursor.execute("""
        UPDATE reviews
        SET title = %s, content = %s
        WHERE id = %s
        RETURNING id, title, content, nickname, created_at, images
    """, (new_title, new_content, review_id))

    updated = cursor.fetchone()
    conn.commit()
    conn.close()

    return updated

@router.get("/by-nickname/{nickname}", response_model=List[ReviewOut])
def get_reviews_by_nickname(nickname: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, content, nickname, created_at, images
        FROM reviews
        WHERE nickname = %s
        ORDER BY created_at DESC
    """, (nickname,))
    reviews = cursor.fetchall()
    conn.close()

    if not reviews:
        raise HTTPException(status_code=417, detail="Обзоры не найдены для данного пользователя")

    for r in reviews:
        if r["nickname"] is None:
            r["nickname"] = "Аноним"

    return reviews
