from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from uuid import uuid4


class ChatRoom(BaseModel):
    room_id: str
    name: str
    creator_id: str
    participants: List[Dict]
    max_participants: int = 10


class CreateRoomRequest(BaseModel):
    name: str = Field(..., example="Cool Game Room")
    creator_id: str
    room_id: Optional[str] = Field(
        default_factory=lambda: str(uuid4())
    )  # Optional custom ID
    max_participants: int = Field(default=10, ge=2, le=100)
    visibility: Literal["public", "private"] = "public"
    type: Literal["lobby", "game", "custom"] = "game"

    class Config:
        schema_extra = {
            "example": {
                "name": "Lobby",
                "creator_id": "user_abc123",
                "room_id": "lobby",  # or None to autogenerate
                "max_participants": 100,
                "visibility": "public",
                "type": "lobby",
            }
        }


class JoinRoomRequest(BaseModel):
    room_id: str
    user_id: str  # still needed for tracking the HTTP join
    username: str
