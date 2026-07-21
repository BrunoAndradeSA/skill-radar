from pathlib import Path

LOG_FOLDER = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_FOLDER.mkdir(parents=True, exist_ok=True)

LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"

DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
