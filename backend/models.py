from pydantic import BaseModel, ValidationError


# Define your subscription payload model
class SubscribePayload(BaseModel):
    event: str
