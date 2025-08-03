# decorators.py

from functools import wraps
from pydantic import ValidationError


def validate_payload(model_class):
    def decorator(func):
        @wraps(func)
        async def wrapper(self, sid, data, *args, **kwargs):
            try:
                validated = model_class(**data)
            except ValidationError as e:
                await self._emit_error(sid, f"Invalid payload: {e.errors()}")
                return {
                    "success": False,
                    "namespace": self.namespace,
                    "error": "Invalid payload",
                    "details": e.errors(),
                    "from": "chat validate_payload decorator",
                }
            return await func(self, sid, validated, *args, **kwargs)

        return wrapper

    return decorator
