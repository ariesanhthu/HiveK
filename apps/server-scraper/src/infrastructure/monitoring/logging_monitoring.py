import logging
import sys
from .interface import IMonitoringService
from .formatter import ColoredFormatter
from infrastructure.di.decorators import Injectable

# Define SUCCESS level
SUCCESS_LEVEL_NUM = 25
logging.addLevelName(SUCCESS_LEVEL_NUM, "SUCCESS")

def success(self, message, *args, **kws):
    if self.isEnabledFor(SUCCESS_LEVEL_NUM):
        self._log(SUCCESS_LEVEL_NUM, message, args, **kws)

logging.Logger.success = success

@Injectable(token=IMonitoringService)
class LoggingMonitoringService(IMonitoringService):
    def __init__(self, name: str = "app"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # Avoid duplicate handlers
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(ColoredFormatter())
            self.logger.addHandler(handler)
            # Prevent propagation to root logger which might have different format
            self.logger.propagate = False

    def debug(self, message: str, **kwargs):
        self.logger.debug(message, extra=kwargs)

    def info(self, message: str, **kwargs):
        self.logger.info(message, extra=kwargs)

    def success(self, message: str, **kwargs):
        self.logger.success(message, extra=kwargs)

    def warn(self, message: str, **kwargs):
        self.logger.warning(message, extra=kwargs)

    def error(self, message: str, **kwargs):
        self.logger.error(message, extra=kwargs)

    def critical(self, message: str, **kwargs):
        self.logger.critical(message, extra=kwargs)
