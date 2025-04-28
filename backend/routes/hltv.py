
import os
from dotenv import load_dotenv
import httpx
from typing import Any, List, Optional

from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Query


from utils.hltv_util import get_upcoming_cs2_matches

router = APIRouter(prefix="/hltv", tags=["CS2"])

class CSMatch(BaseModel):
    team_left: str
    team_right: str
    league: str
    datetime: str
    timestamp: str
    stream_link: str

@router.get("/matches")
def get_matches():
    print("hltv")
    
    res = get_upcoming_cs2_matches()
    print(res)
    return res



