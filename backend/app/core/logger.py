import colorlog
import logging

def setup_custom_logger(name):
    # Note the double 't' in Formatter
    formatter = colorlog.ColoredFormatter(
        "%(log_color)s%(levelname)-8s%(reset)s %(blue)s[%(filename)s:%(lineno)d]%(reset)s %(message)s",
        log_colors={
            'DEBUG':    'cyan',
            'INFO':     'green',
            'WARNING':  'yellow',
            'ERROR':    'red',
            'CRITICAL': 'red,bg_white',
        }
    )

    handler = colorlog.StreamHandler()
    handler.setFormatter(formatter)

    logger = colorlog.getLogger(name)
    # Avoid adding multiple handlers if the function is called twice
    if not logger.handlers:
        logger.addHandler(handler)
        
    logger.setLevel(logging.INFO)
    return logger

logger = setup_custom_logger("FinReady")