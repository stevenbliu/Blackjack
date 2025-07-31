from datetime import datetime, timedelta
from jose import jwt, JWTError
from uuid import uuid4
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Optional, Dict

# Configuration
SECRET_KEY = "your-secret-key"  # Use env var in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
GUEST_PREFIX = "guest_"

# OAuth2 scheme for token dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def create_access_token(user_id: str, is_guest: bool = False) -> str:
    """Generate JWT token"""
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta

    to_encode = {
        "sub": f"{GUEST_PREFIX}{user_id}" if is_guest else user_id,
        "exp": expire,
        "is_guest": is_guest,
        "jti": str(uuid4()),  # Unique token identifier
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload if payload.get("sub") else None
    except JWTError:
        return None


def generate_guest_id() -> str:
    """Generate unique guest ID"""
    return str(uuid4())


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency to get current user from token"""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"id": payload["sub"], "is_guest": payload.get("is_guest", False)}
