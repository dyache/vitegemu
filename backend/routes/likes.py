from typing import List
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from psycopg2.extras import RealDictCursor
from schemas import CountResponse, LikeCreate
from db import get_connection
from utils.auth_utils import get_current_user

router = APIRouter(prefix = "/likes", tags=["Лайки"])

@router.post("/", response_model=LikeCreate)
def add_like(
    like: LikeCreate,
    current_user: dict = Depends(get_current_user)
):
    print(current_user)
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Get the user's ID from the email
    cursor.execute("SELECT id FROM users WHERE email = %s", (current_user["email"],))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")


    # Optional: prevent duplicate likes
    cursor.execute("SELECT 1 FROM likes WHERE user_email = %s AND review_id = %s", (current_user["email"], like.review_id))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Like already exists")

    # Insert the like
    cursor.execute(
        "INSERT INTO likes (user_email, review_id) VALUES (%s, %s)",
        (current_user["email"], like.review_id)
    )

    conn.commit()
    conn.close()

    return {
        "user_email": like.user_email,
        "review_id": like.review_id
    }

@router.get("/{review_id}/likes", response_model=List[str])
def get_likes_for_review(review_id: int):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""
        SELECT u.email
        FROM likes l
        JOIN users u ON l.user_email = u.email
        WHERE l.review_id = %s
    """, (review_id,))

    users = cursor.fetchall()
    conn.close()

    return [user["email"] for user in users]

@router.get("/{review_id}/likes/count", response_model=CountResponse)
def get_likes_count(review_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM likes WHERE review_id = %s", (review_id,))
    result = cursor.fetchone()
    conn.close()

    if result is None:
        return 0  # fallback if something's off


    return {"count" : result['count']} 

@router.delete("/{review_id}/likes", status_code=204)
def delete_like(
    review_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor()

    # Get the user ID from the email
    cursor.execute("SELECT id FROM users WHERE email = %s", (current_user["email"],))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")


    cursor.execute("DELETE FROM likes WHERE user_email = %s AND review_id = %s", (current_user["email"], review_id))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Like not found")

    conn.commit()
    conn.close()
