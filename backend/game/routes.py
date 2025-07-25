from shared.socket import game_namespace


@game_namespace.event
async def move(sid, data):
    """Handle game moves"""
    session = await game_namespace.get_session(sid)
    await game_namespace.emit(
        "game_update",
        {"move": data["move"], "player": session["user_id"]},
        room=data["game_id"],
    )
