import logging


def with_auth(handler):
    @wraps(handler)
    async def wrapper(sid, environ, auth):
        # logging.info(f"[ROOT] Auth Middleware: {auth}")
        try:
            logging.info(f"[ROOT] Auth Middleware: {auth}")

            # ✅ Validate the auth dict using AuthPayload model
            validated_auth = AuthPayload(**auth)
            logging.info(
                f"Passing validated_auth: {validated_auth} of type {type(validated_auth)}"
            )
            if TEST_MODE and auth.get("token") == "test-token":
                await sio.save_session(sid, {"user_id": "test-user-id"})
                return await handler(sid, environ, validated_auth)

            if not auth or "token" not in auth:
                raise ConnectionRefusedError("Missing or invalid auth")

            # ✅ Verify token
            payload = verify_token(validated_auth.token)
            user_id = payload.get("sub")
            await sio.save_session(sid, {"user_id": user_id})
            return await handler(
                sid, environ, validated_auth
            )  # <- Pass validated model

        except ValidationError as e:
            logging.warning(f"[AUTH VALIDATION ERROR] {e}")
            raise ConnectionRefusedError("Invalid auth format")
        except ExpiredSignatureError:
            logging.warning(f"[AUTH] Token expired for sid={sid}")
            raise ConnectionRefusedError("Token expired")
        except Exception as e:
            logging.error(f"[AUTH] Token verification failed: {e}")
            raise ConnectionRefusedError("Auth failed")

    return wrapper
