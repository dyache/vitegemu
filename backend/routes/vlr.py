import os
from dotenv import load_dotenv
import httpx
from typing import Any, List, Optional

from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Query

load_dotenv()

VLT_API_URL= os.getenv("VLR_API_URL")

if not VLT_API_URL:
    raise RuntimeError("VLR_APU_URL не найден в .env файле")



class Team(BaseModel):
    name: str
    country: str
    score: Optional[str]


class Match(BaseModel):
    id: str
    teams: List[Team]
    status: str
    event: str
    tournament: str
    img: str
    in_: str = Field(..., alias='in')
    timestamp: int
    utcDate: str
    utc: str


class MatchResp(BaseModel):
    status: Optional[str] = None
    size: Optional[int] = None
    data: Optional[List[Match]] = None


router = APIRouter(prefix="/vlr", tags=["Valorant"])

@router.get("/matches", tags=["Valorant", "Матчи"] )
def get_valorant_matches():
    r = httpx.get(VLT_API_URL + "/matches", timeout=10.0)
    if r.status_code != 200:
        raise HTTPException(status_code=500, detail="Непредвиденная ошибка с vlr api")
    return r.text



class Event(BaseModel):
    id: str
    name: str
    status: str
    prizepool: str
    dates: str
    country: str
    img: str


class EventResp(BaseModel):
    status: Optional[str] = None
    size: Optional[int] = None
    data: Optional[List[Event]] = None

@router.get("/events", tags=["Valorant", "Ивенты"])
async def get_events(
    page: int = Query(1, ge=1),
    status: str = Query("all", regex="^(all|ongoing|upcoming|completed)$"),
    region: str = Query("all", regex="^(all|na|eu|ap|ch)$")
):
    url =  VLT_API_URL + "/events"   
    params = {
        "page": page,
        "status": status,
        "region": region
    }

    r = httpx.get(url, params=params)
    r.raise_for_status()


    return r.text
