from enum import Enum, auto

class Scope(Enum):
    SINGLETON = auto()
    TRANSIENT = auto()
    REQUEST = auto()
