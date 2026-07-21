from __future__ import annotations

import logging
from logging.handlers import TimedRotatingFileHandler

from app.shared.constants import DATE_FORMAT, LOG_FOLDER, LOG_FORMAT

handler = TimedRotatingFileHandler(
    filename=LOG_FOLDER / "app.log",
    when="midnight",
    interval=1,
    backupCount=15,
    encoding="utf-8",
)

handler.suffix = "%Y-%m-%d"

formatter = logging.Formatter(
    fmt=LOG_FORMAT,
    datefmt=DATE_FORMAT,
)

handler.setFormatter(formatter)

logger = logging.getLogger("app")

logger.setLevel(logging.DEBUG)

if not logger.handlers:
    logger.addHandler(handler)

logger.propagate = False
