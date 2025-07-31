from fastapi import APIRouter, HTTPException
from typing import List
from chat.models import ChatRoom, CreateRoomRequest, JoinRoomRequest
from chat.service import ChatRoomService  # adjust path if needed

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/create", response_model=ChatRoom)
def create_room(data: CreateRoomRequest):
    return ChatRoomService.create_room(data)


@router.post("/join", response_model=ChatRoom)
def join_room(data: JoinRoomRequest):
    try:
        return ChatRoomService.join_room(
            room_id=data.room_id,
            user_id=data.user_id,
            username=data.username,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/rooms", response_model=List[ChatRoom])
def list_rooms():
    return ChatRoomService.list_rooms()


@router.get("/rooms/{room_id}", response_model=ChatRoom)
def get_room(room_id: str):
    room = ChatRoomService.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
