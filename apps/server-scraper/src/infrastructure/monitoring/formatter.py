import logging

class ColoredFormatter(logging.Formatter):
    """
    Standard ANSI color codes for terminal logging.
    """
    GREY = "\x1b[38;20m"
    BLUE = "\x1b[34;20m"
    GREEN = "\x1b[32;20m"
    YELLOW = "\x1b[33;20m"
    RED = "\x1b[31;20m"
    BOLD_RED = "\x1b[31;1m"
    RESET = "\x1b[0m"
    
    # Format: [Time] [Level] [LoggerName] - Message
    FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    LEVEL_COLORS = {
        logging.DEBUG: GREY,
        logging.INFO: BLUE,
        25: GREEN,  # Custom SUCCESS level
        logging.WARNING: YELLOW,
        logging.ERROR: RED,
        logging.CRITICAL: BOLD_RED,
    }

    def format(self, record):
        color = self.LEVEL_COLORS.get(record.levelno, self.RESET)
        log_fmt = f"{color}{self.FORMAT}{self.RESET}"
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)
