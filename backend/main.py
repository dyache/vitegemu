from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import hltv, reviews  
from db import init_db
from routes import auth
from routes import profile
from routes import users
from routes import comments
from routes import likes
from routes import dislikes
from routes import vlr

app = FastAPI(title="Gemu API")

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(reviews.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(users.router)
app.include_router(comments.router)
app.include_router(likes.router)
app.include_router(dislikes.router)
app.include_router(hltv.router)
app.include_router(vlr.router)
