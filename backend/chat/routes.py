from shared.socket import chat_namespace


@chat_namespace.event
async def message(sid, data):
    """Handle chat messages"""
    session = await chat_namespace.get_session(sid)
    await chat_namespace.emit(
        "new_message", {"user": session["user_id"], "text": data["text"]}
    )
