from pydantic import BaseModel
from typing import Optional


class AuthPayload(BaseModel):
    token: str
    user_id: str
    username: Optional[str]
