# from socketio import AsyncServer

import socketio


class MockSessionManager:
    def __init__(self):
        self.sessions = {}

    async def get_session(self, sid):
        session = self.sessions.get(sid)
        if not session:
            return None
        return {
            "authenticated": True,
            "user_id": session.get("user_id"),  # sid as user_id
            "username": session.get("username"),  # client username
            "user_sid": session.get("user_sid"),
        }

    async def create_session(self, sid, token):
        self.sessions[sid] = {"token": token, "authenticated": True}

    async def delete_session(self, sid):
        self.sessions.pop(sid, None)


class MockConnectionManager:
    def __init__(self, sio: socketio.AsyncServer):
        self.sio = sio
        self.connections = {}
        self.rooms = {}  # map sid -> set of room_ids

    async def add_connection(self, sid, **kwargs):
        self.connections[sid] = kwargs
        self.rooms[sid] = set()

    async def remove_connection(self, sid):
        self.connections.pop(sid, None)
        self.rooms.pop(sid, None)

    async def join_room(self, sid, room_id, namespace=None):
        await self.sio.enter_room(sid, room_id, namespace=namespace)
        if sid not in self.rooms:
            self.rooms[sid] = set()
        self.rooms[sid].add(room_id)
        return True

    async def send_to_room(self, event, data, namespace=None, room_id=None):
        if room_id:
            await self.sio.emit(event, data, room=room_id, namespace=namespace)
        else:
            await self.sio.emit(event, data, namespace=namespace)

    def get_user_rooms(self, sid):
        return list(self.rooms.get(sid, []))
