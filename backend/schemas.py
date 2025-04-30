from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    title: str
    content: str

class ReviewOut(BaseModel):
    id: int
    title: str
    content: str
    nickname: Optional[str] = "Аноним"
    created_at: Optional[datetime]

class ReviewUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    nickname: str
    is_admin: bool = False

class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ProfileUpdate(BaseModel):
    nickname: str
    bio: str | None = None


class UserOut(BaseModel):
    id: int
    email: str
    nickname: str | None = None
    bio: str | None = None

class CommentCreate(BaseModel):
    content: str

class CommentOut(BaseModel):
    id: int
    author_nickname: str
    content: str
    created_at: datetime

class CommentUpdate(BaseModel):
    content: str

class LikeCreate(BaseModel):
    review_id: int

class DislikeCreate(BaseModel):
    review_id: int

class CountResponse(BaseModel):
    count: int
