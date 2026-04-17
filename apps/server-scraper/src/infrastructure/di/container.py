import inspect
from typing import Dict, Type, Any, Optional, get_type_hints
from .scopes import Scope

class Container:
    _providers: Dict[Any, Dict[str, Any]] = {}
    _instances: Dict[Any, Any] = {}

    @classmethod
    def register(cls, token: Any, implementation: Type[Any], scope: Scope = Scope.SINGLETON):
        """Register a class or token into the container."""
        cls._providers[token] = {
            "implementation": implementation,
            "scope": scope
        }

    @classmethod
    def get(cls, token: Any) -> Any:
        """Resolve and return an instance for the given token."""
        if token in cls._instances:
            return cls._instances[token]

        if token not in cls._providers:
            # If not registered but is a class, try to resolve it directly (auto-registration)
            if inspect.isclass(token):
                # Check if it's an abstract class/interface
                if inspect.isabstract(token):
                    raise ValueError(f"Cannot instantiate abstract class/interface '{token.__name__}'. "
                                     f"Ensure an implementation is registered in the Container.")
                return cls._create_instance(token)
            raise ValueError(f"Provider for token '{token}' not found in Container.")

        provider = cls._providers[token]
        implementation = provider["implementation"]
        scope = provider["scope"]

        instance = cls._create_instance(implementation)

        if scope == Scope.SINGLETON:
            cls._instances[token] = instance
        
        return instance

    @classmethod
    def _create_instance(cls, implementation: Type[Any]) -> Any:
        """Instantiate a class by recursively resolving its constructor dependencies."""
        signature = inspect.signature(implementation.__init__)
        type_hints = get_type_hints(implementation.__init__)
        
        args = {}
        for name, param in signature.parameters.items():
            if name == 'self' or param.kind in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD):
                continue
            
            dep_token = type_hints.get(name)
            
            # 1. Check if we have a registered provider or forced instance
            if dep_token in cls._providers or dep_token in cls._instances:
                args[name] = cls.get(dep_token)
            
            # 2. Use default value if it's a built-in type or doesn't have a provider
            elif param.default is not inspect.Parameter.empty:
                args[name] = param.default
            
            # 3. Try auto-resolving Class tokens (if not built-in)
            elif dep_token and inspect.isclass(dep_token) and dep_token.__module__ != 'builtins':
                try:
                    args[name] = cls.get(dep_token)
                except Exception:
                    raise ValueError(f"Cannot resolve class dependency '{name}: {dep_token.__name__}' for {implementation.__name__}")
            
            else:
                raise ValueError(f"Cannot resolve dependency '{name}' for {implementation.__name__}: Missing type hint, registration, or default value.")

        return implementation(**args)

    @classmethod
    async def initialize_all(cls):
        """
        Instantiate all registered singletons and call their on_init() hooks.
        """
        # 1. Instantiate all singletons first
        for token, provider in cls._providers.items():
            if provider["scope"] == Scope.SINGLETON:
                cls.get(token)
        
        # 2. Call on_init hooks
        for instance in list(cls._instances.values()):
            if hasattr(instance, "on_init") and inspect.iscoroutinefunction(instance.on_init):
                await instance.on_init()
