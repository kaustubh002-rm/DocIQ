from pymongo import MongoClient
from app.config import MONGODB_URI, DATABASE_NAME

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

pdf_collection = db["pdf_metadata"]

users_collection = db["users"]

chat_collection = db["chat_history"]

pdf_chunks_collection = db["pdf_chunks"]