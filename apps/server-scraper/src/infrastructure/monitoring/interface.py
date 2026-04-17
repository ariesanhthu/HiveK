from abc import ABC, abstractmethod

class IMonitoringService(ABC):
    @abstractmethod
    def debug(self, message: str, **kwargs):
        pass

    @abstractmethod
    def info(self, message: str, **kwargs):
        pass

    @abstractmethod
    def success(self, message: str, **kwargs):
        pass

    @abstractmethod
    def warn(self, message: str, **kwargs):
        pass

    @abstractmethod
    def error(self, message: str, **kwargs):
        pass

    @abstractmethod
    def critical(self, message: str, **kwargs):
        pass
