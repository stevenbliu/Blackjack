import logging
import json
from fastapi import WebSocket, WebSocketDisconnect
from game_manager import GameManager
from starlette.websockets import WebSocketState
import uuid
import traceback


async def websocket_endpoint(websocket: WebSocket, game_manager: GameManager):
    """Handle WebSocket connections for the game."""

    try:
        await websocket.accept()
        logging.info("WebSocket connection accepted")

        player_id = websocket.query_params.get("playerId")
        if not player_id:
            player_id = str(uuid.uuid4())
            logging.info(f"Assigned new playerId: {player_id}")

        await websocket.send_text(
            json.dumps({"action": "player_id", "playerId": player_id})
        )

        game_manager.add_connection(player_id, websocket)
        logging.info(f"Player {player_id} connected and assigned ID")

        try:
            while True:
                message = await websocket.receive_text()
                data = json.loads(message)
                action = data.get("action")
                request_id = data.get("requestId", None)

                logging.info(
                    f"Received action '{action}' from player {player_id} with requestId={request_id}"
                )
                logging.info(f"message: {message}")

                if action == "create_game":
                    game_id = await create_game(player_id, websocket, game_manager)
                    logging.info(f"Player {player_id} created game {game_id}")
                    await websocket.send_text(
                        json.dumps(
                            {
                                "action": "game_created",
                                "gameId": game_id,
                                "requestId": request_id,
                            }
                        )
                    )

                    page = data.get("page", 1)
                    limit = data.get("limit", 10)

                    games_data = game_manager.get_available_games(
                        page=page, limit=limit
                    )

                    broadcast_message = json.dumps(
                        {
                            "action": "lobby_update",
                            "games": games_data["games"],
                            "currentPage": games_data["currentPage"],
                            "totalPages": games_data["totalPages"],
                            "requestId": request_id,
                        }
                    )
                    # Optionally broadcast lobby update to all clients
                    await websocket.send_text(broadcast_message)

                elif action == "join_game":
                    game_id = data.get("gameId")
                    if game_id:
                        result = await join_game(
                            player_id, game_id, websocket, game_manager
                        )
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "action": "game_joined",
                                    "gameId": game_id,
                                    "success": result,
                                    "requestId": request_id,
                                }
                            )
                        )
                        # Optionally broadcast lobby update to all clients
                        await game_manager.broadcast_lobby(
                            json.dumps(
                                {
                                    "action": "lobby_update",
                                    "games": game_manager.get_available_games(),
                                    "requestId": request_id,
                                }
                            )
                        )
                    else:
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "action": "error",
                                    "message": "No gameId provided",
                                    "requestId": request_id,
                                }
                            )
                        )
                elif action == "leave_game":
                    game_id = data.get("gameId")
                    if game_id:
                        game_manager.remove_player(player_id)
                        game_manager.remove_connection(player_id)
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "action": "game_left",
                                    "gameId": game_id,
                                    "requestId": request_id,
                                }
                            )
                        )
                        # Optionally broadcast lobby update to all clients
                        await game_manager.broadcast_lobby(
                            json.dumps(
                                {
                                    "action": "lobby_update",
                                    "games": game_manager.get_available_games(),
                                    "requestId": request_id,
                                }
                            )
                        )
                    else:

                        await websocket.send_text(
                            json.dumps(
                                {
                                    "action": "error",
                                    "message": "No gameId provided",
                                    "requestId": request_id,
                                }
                            )
                        )

                elif action == "lobby":
                    logging.info(f"123 {message}, {data}")
                    page = data.get("page", 1)
                    limit = data.get("limit", 10)
                    logging.info(f"Action 'lobby': page{page} limit{limit}")

                    available_games_data = game_manager.get_available_games(
                        page=page, limit=limit
                    )

                    await websocket.send_text(
                        json.dumps(
                            {
                                "action": "lobby_update",
                                "games": available_games_data["games"],
                                "currentPage": available_games_data["currentPage"],
                                "totalPages": available_games_data["totalPages"],
                                "requestId": request_id,
                            }
                        )
                    )

                elif action == "hit":
                    await handle_game_action(
                        game_manager, "hit", player_id, websocket, request_id
                    )

                elif action == "stand":
                    await handle_game_action(
                        game_manager, "stand", player_id, websocket, request_id
                    )

                elif action == "chat_message":
                    chat_type = data.get("type")
                    content = data.get("content")
                    to = data.get("to")  # only used for private
                    timestamp = data.get("timestamp")
                    message_id = data.get("message_id")

                    chat_message = {
                        "action": "chat_message",
                        "message_id": message_id,
                        "player_id": player_id,
                        "content": content,
                        "timestamp": timestamp,
                        "type": chat_type,
                        "to": to,
                    }

                    if chat_type == "lobby":
                        await game_manager.broadcast_lobby(json.dumps(chat_message))
                    elif chat_type == "game":
                        await game_manager.broadcast_to_game(
                            player_id, json.dumps(chat_message)
                        )
                    elif chat_type == "private" and to:
                        await game_manager.send_private_message(
                            player_id, to, json.dumps(chat_message)
                        )
                    else:
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "action": "error",
                                    "message": "Invalid chat message",
                                    "requestId": request_id,
                                }
                            )
                        )

                else:
                    logging.warning(f"Unknown action: {action}")
                    await websocket.send_text(
                        json.dumps(
                            {
                                "action": "error",
                                "message": "Unknown action",
                                "requestId": request_id,
                            }
                        )
                    )

        except WebSocketDisconnect:
            logging.info(f"Player {player_id} disconnected")
            game_manager.remove_player(player_id)
            game_manager.remove_connection(player_id)
            await websocket.close()
    except Exception as e:
        logging.error(f"Error in WebSocket connection: {e}")
        traceback.print_exc()
    finally:
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.close()
        except Exception as e:
            logging.error(f"Error closing WebSocket: {e}")
        logging.info("WebSocket connection closed")


async def create_game(player_id: str, websocket: WebSocket, game_manager: GameManager):
    game = game_manager.create_new_game()
    game_id = game["game_id"]
    game_manager.add_player_to_game(game, player_id, websocket)
    return game_id


async def join_game(
    player_id: str, game_id: str, websocket: WebSocket, game_manager: GameManager
):
    game = game_manager.games.get(game_id)
    if game:
        return game_manager.add_player_to_game(game, player_id, websocket)
    else:
        logging.warning(f"Game {game_id} not found when trying to join")
        return False


async def handle_game_action(
    game_manager: GameManager,
    action: str,
    player_id: str,
    websocket: WebSocket,
    request_id: str = None,
):
    game = game_manager.find_game_by_player(player_id)
    if not game:
        await websocket.send_text(
            json.dumps(
                {
                    "action": "error",
                    "message": "Game not found",
                    "requestId": request_id,
                }
            )
        )
        return

    if action == "hit":
        card = game_manager.deal_card(game["deck"])
        if card:
            game["players"][player_id]["hand"].append(card)
            await websocket.send_text(
                json.dumps(
                    {"action": "card_dealt", "card": card, "requestId": request_id}
                )
            )
        else:
            await websocket.send_text(
                json.dumps(
                    {
                        "action": "error",
                        "message": "No cards left",
                        "requestId": request_id,
                    }
                )
            )

    elif action == "stand":
        await websocket.send_text(
            json.dumps({"action": "stand_acknowledged", "requestId": request_id})
        )
