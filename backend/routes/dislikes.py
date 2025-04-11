from typing import List
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from psycopg2.extras import RealDictCursor
from schemas import LikeCreate
from db import get_connection
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/dislikes", tags=["Дизлайки"])

@router.post("/", response_model=LikeCreate)
def add_dislike(
    dislike: LikeCreate,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("SELECT id FROM users WHERE email = %s", (current_user["email"],))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user["id"]

    cursor.execute("SELECT 1 FROM dislikes WHERE user_id = %s AND review_id = %s", (user_id, dislike.review_id))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Dislike already exists")

    cursor.execute(
        "INSERT INTO dislikes (user_id, review_id) VALUES (%s, %s)",
        (user_id, dislike.review_id)
    )

    conn.commit()
    conn.close()

    return {
        "user_email": dislike.user_email,
        "review_id": dislike.review_id
    }

@router.get("/{review_id}/dislikes", response_model=List[str])
def get_dislikes_for_review(review_id: int):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""
        SELECT u.email
        FROM dislikes d
        JOIN users u ON d.user_id = u.id
        WHERE d.review_id = %s
    """, (review_id,))

    users = cursor.fetchall()
    conn.close()

    return [user["email"] for user in users]

@router.get("/{review_id}/dislikes/count", response_model=int)
def get_dislikes_count(review_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM dislikes WHERE review_id = %s", (review_id,))
    result = cursor.fetchone()
    conn.close()

    if result is None:
        return 0

    return result[0]

@router.delete("/{review_id}/dislikes", status_code=204)
def delete_dislike(
    review_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email = %s", (current_user["email"],))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user[0]

    cursor.execute("DELETE FROM dislikes WHERE user_id = %s AND review_id = %s", (user_id, review_id))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Dislike not found")

    conn.commit()
    conn.close()
