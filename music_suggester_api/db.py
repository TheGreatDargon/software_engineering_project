
import os
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv

# Find the project's root folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Load credentials from the .env file
load_dotenv(BASE_DIR / ".env")

def get_db_connection():
    connection = mysql.connector.connect(
        host=os.environ["DB_HOST"],
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.environ["DB_NAME"]
    )

    return connection