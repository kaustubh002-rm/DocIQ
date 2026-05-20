import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

MONGODB_URI = os.getenv("MONGODB_URI")

DATABASE_NAME = os.getenv("DATABASE_NAME")

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")