# modelsWs.py

from pydantic import BaseModel, Field
from typing import Optional


class JoinRoomPayload(BaseModel):
    room_id: str = Field(..., min_length=1)


class MessagePayload(BaseModel):
    room_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)


class TestPayload(BaseModel):
    room_id: Optional[str]
    message: str = Field(..., min_length=1)
