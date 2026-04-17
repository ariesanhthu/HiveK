from typing import Optional, Any, Type
from .scopes import Scope
from .container import Container

def Injectable(token: Optional[Any] = None, scope: Scope = Scope.SINGLETON):
    """
    Decorator to register a class as a DI provider.
    If no token is provided, the class itself is used as the key.
    """
    def decorator(cls: Type[Any]):
        effective_token = token if token is not None else cls
        Container.register(effective_token, cls, scope)
        return cls
    return decorator
