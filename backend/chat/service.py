from uuid import uuid4
from typing import Dict, List
from chat.modelsHttp import (
    ChatRoom,
    CreateRoomRequest,
)  # adjust import path if needed
import logging
from fastapi import HTTPException, status

chat_rooms: Dict[str, ChatRoom] = {}


class ChatRoomService:

    def __init__(self):
        self._initialize_static_rooms()

    def _initialize_static_rooms(self):
        """Create static/global rooms on startup like 'lobby'."""
        static_rooms = [
            {
                "room_id": "chat_lobby",
                "name": "Lobby",
                "creator_id": "system",
                "max_participants": 1000,
            },
            # Add more system rooms here if needed
        ]

        for config in static_rooms:
            chat_rooms[config["room_id"]] = ChatRoom(
                room_id=config["room_id"],
                name=config["name"],
                creator_id=config["creator_id"],
                participants=[],
                max_participants=config["max_participants"],
            )

    @staticmethod
    def create_room(data: CreateRoomRequest) -> ChatRoom:
        # Use provided room_id if it's a global/lobby room; otherwise generate one
        room_id = data.room_id if getattr(data, "room_id", None) else str(uuid4())[:8]

        if room_id in chat_rooms:
            logging.info(f"Room with ID '{room_id}' already exists. Skipping creation.")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Room with ID '{room_id}' already exists.",
            )
        new_room = ChatRoom(
            room_id=room_id,
            name=data.name,
            creator_id=data.creator_id,
            participants=[
                {
                    "user_id": data.creator_id,
                    "username": data.creator_id,  # placeholder until real username is added
                }
            ],
            max_participants=data.max_participants,
            # success=True,
        )

        chat_rooms[room_id] = new_room
        return new_room

    @staticmethod
    def join_room(room_id: str, user_id: str, username: str) -> ChatRoom:
        room = chat_rooms.get(room_id)
        if not room:
            raise ValueError("Room not found")

        # Prevent duplicate joins by user_id
        if any(p["user_id"] == user_id for p in room.participants):
            return room

        if len(room.participants) >= room.max_participants:
            raise ValueError("Room is full")

        # Add user with both ID and display name
        room.participants.append(
            {
                "user_id": user_id,
                "username": username,
            }
        )

        return room

    @staticmethod
    def list_rooms() -> List[ChatRoom]:
        return list(chat_rooms.values())

    @staticmethod
    def get_room(room_id: str) -> ChatRoom | None:
        return chat_rooms.get(room_id)


chatService = ChatRoomService()
