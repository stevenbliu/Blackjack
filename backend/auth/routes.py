# auth/routes.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from .service import create_access_token, verify_token, generate_guest_id
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

limiter = Limiter(key_func=get_remote_address)
import logging


# @router.post("/auth/guest")
# @limiter.limit("5/minute")
@router.post("/guest")
async def create_guest_session():
    """Create a temporary guest account"""

    try:
        user_id = "guest_" + generate_guest_id()
        token = create_access_token(user_id, is_guest=True)
        logging.info("Guest session created successfully")
        return {
            "access_token": token,
            "token_type": "bearer",  # Standard OAuth2 response
            "user_id": user_id,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Guest session creation failed: {str(e)}"
        )


@router.get("/")
async def auth_test():
    return {"status": "Auth Service is running."}


def valid_credentials(username, password):
    return True


def get_user_id(username):
    return "user_1"


def get_username(user_id):
    return "user_1"


@router.post("/login")
async def login(username: str, password: str):
    """Regular user login (simplified example)"""
    # Add your actual user authentication logic here
    if not valid_credentials(username, password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = get_user_id(username)  # Your DB lookup
    token = create_access_token(user_id)
    return {"access_token": token}


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency to get current user from JWT"""
    try:
        payload = verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {"id": payload["sub"], "is_guest": payload.get("is_guest", False)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401, detail=f"Token verification failed: {str(e)}"
        )


@router.get("/protected")
async def protected_route(user=Depends(get_current_user)):
    return {"message": "Hello!", "user": user}
