from fastapi import APIRouter, Depends, HTTPException, Path
from db import get_connection
from utils.auth_utils import get_current_user
from schemas import CommentUpdate, CommentCreate, CommentOut
from typing import List

router = APIRouter(prefix="/reviews", tags=["Комментарии"])

@router.get("/{review_id}/comments", response_model=List[CommentOut])
def get_comments(review_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, author_nickname, content, created_at FROM comments WHERE review_id = %s ORDER BY id ASC",
        (review_id,)
    )
    comments = cursor.fetchall()
    conn.close()
    return comments

@router.post("/{review_id}/comments", response_model=CommentOut)
def add_comment(
    review_id: int,
    comment: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT nickname FROM users WHERE email = %s", (current_user["email"],))
    user = cursor.fetchone()
    nickname = user["nickname"] if user else "Аноним"

    cursor.execute(
        "INSERT INTO comments (review_id, author_nickname, content) VALUES (%s, %s, %s) RETURNING id, created_at",
        (review_id, nickname, comment.content)
    )
    result = cursor.fetchone()
    conn.commit()
    conn.close()

    return {
        "id": result["id"],
        "author_nickname": nickname,
        "content": comment.content,
        "created_at": result["created_at"].isoformat()
    }

@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT author_nickname FROM comments WHERE id = %s", (comment_id,))
    comment = cursor.fetchone()

    if not comment:
        raise HTTPException(status_code=404, detail="Комментарий не найден")

    cursor.execute("SELECT nickname, is_admin FROM users WHERE email = %s", (current_user["email"],))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=403, detail="Пользователь не найден")

    is_author = comment["author_nickname"] == user["nickname"]
    is_admin = user["is_admin"]

    if not (is_author or is_admin):
        raise HTTPException(status_code=403, detail="Недостаточно прав для удаления")

    cursor.execute("DELETE FROM comments WHERE id = %s", (comment_id,))
    conn.commit()
    conn.close()

    return {"message": f"Комментарий {comment_id} удалён"}

@router.patch("/comments/{comment_id}", response_model=CommentOut)
def update_comment(
    comment_id: int,
    data: CommentUpdate,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT author_nickname FROM comments WHERE id = %s", (comment_id,))
    comment = cursor.fetchone()

    if not comment:
        raise HTTPException(status_code=404, detail="Комментарий не найден")

    cursor.execute("SELECT nickname FROM users WHERE email = %s", (current_user["email"],))
    user = cursor.fetchone()
    if not user or comment["author_nickname"] != user["nickname"]:
        raise HTTPException(status_code=403, detail="Вы не автор комментария")

    # Обновляем
    cursor.execute(
        "UPDATE comments SET content = %s WHERE id = %s RETURNING id, author_nickname, content, created_at",
        (data.content, comment_id)
    )
    updated = cursor.fetchone()
    conn.commit()
    conn.close()

    return updated
