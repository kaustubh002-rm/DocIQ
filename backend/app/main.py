from dotenv import load_dotenv
load_dotenv()

import os
from datetime import datetime
from fastapi.responses import FileResponse
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.pdf_utils import extract_text_from_pdf
from app.rag_pipeline import create_vector_store, get_qa_chain
from app.database import (
    pdf_collection,
    users_collection,
    chat_collection,
    pdf_chunks_collection
)
from app.models import QuestionRequest

from jose import jwt
from fastapi import Header

# =========================
# APP INIT
# =========================
app = FastAPI()

from app.database import users_collection
from app.auth import (
    hash_password,
    verify_password,
    create_access_token
)

from app.models import (
    SignupRequest,
    LoginRequest
)
# =========================
# CORS (FIXED)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,          # Change to True
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# =========================
# CONFIG
# =========================
UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

CURRENT_FILE = None


SECRET_KEY = "YOUR_SECRET_KEY"

def get_user_id(authorization:str):

    token = authorization.split(" ")[1]

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=["HS256"]
    )

    return payload["user_id"]


@app.post("/signup")
def signup(data: SignupRequest):

    existing = users_collection.find_one({
        "email": data.email
    })

    if existing:
        return {
            "error":"User already exists"
        }

    users_collection.insert_one({
        "name":data.name,
        "email":data.email,
        "password":hash_password(data.password)
    })

    return {
        "message":"Signup successful"
    }

@app.post("/login")
def login(data: LoginRequest):

    user = users_collection.find_one({
        "email":data.email
    })

    if not user:
        return {"error":"Invalid credentials"}

    if not verify_password(
        data.password,
        user["password"]
    ):
        return {"error":"Invalid credentials"}

    token = create_access_token({
        "user_id":str(user["_id"])
    })

    return {
        "token":token,
        "name":user["name"]
    }

# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {"message": "PDF RAG API Running"}




# =========================
# UPLOAD PDF (FIXED + SAFE)
# =========================
@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    global CURRENT_FILE

    try:
        print("🔥 Upload started")

        if not authorization:
            return {"error": "Login required"}

        user_id = get_user_id(authorization)

        if not file.filename.endswith(".pdf"):
            return {"error": "Only PDF files allowed"}

        file_path = os.path.join(UPLOAD_DIR, file.filename)

        # Save file
        with open(file_path, "wb") as f:
            f.write(await file.read())

        print("✅ File saved")

        # Extract text
        extracted_text = extract_text_from_pdf(file_path)

        if not extracted_text:
            return {"error": "No text found in PDF"}

        print("✅ Text extracted")

        # Create vector store (IMPORTANT FIX INSIDE PIPELINE)
        _, chunk_count = create_vector_store(extracted_text, file.filename)

        print("✅ Vector store created")

        CURRENT_FILE = file.filename

        # Save metadata
        pdf_collection.insert_one({
            "user_id": user_id,
            "file_name": file.filename,
            "file_path": file_path,
            "upload_date": datetime.utcnow(),
            "chunk_count": chunk_count
        })

        print("✅ DB inserted")

        return {
            "message": "PDF uploaded successfully",
            "file_name": file.filename,
            "chunks": chunk_count,
        }

    except Exception as e:
        print("❌ UPLOAD ERROR:", str(e))
        return {"error": str(e)}

# =========================
# ASK QUESTION
# =========================
@app.post("/ask")
async def ask_question(
    request: QuestionRequest,
    authorization: str = Header(None)
):

    try:

        if not CURRENT_FILE:
            return {
                "error": "Please select a PDF"
        }

        if not authorization:
            return {"error": "Login required"}

        # Get logged-in user id
        user_id = get_user_id(authorization)

        # Run RAG
        qa_chain = get_qa_chain(
             CURRENT_FILE
        )

        response = qa_chain.invoke({
            "input": request.question
        })

        source_docs = response.get(
            "context",
            []
        )

        if not source_docs:
            return {
                "answer":
                "I could not find this information in the uploaded PDF.",
                "sources": []
            }

        answer = response["answer"]

        source_docs = response.get(
            "context",
            []
        )

        seen = set()
        unique_files = []

        for doc in source_docs:

            fname = doc.metadata.get(
                "file_name",
                "Unknown"
            )

            if fname not in seen:

                seen.add(fname)
                unique_files.append(fname)

        # Save chat history
        chat_collection.insert_one({

            "user_id": user_id,

            "question": request.question,

            "answer": answer,

            "sources": unique_files,

            "created_at": datetime.utcnow()

        })

        return {

            "answer": answer,

            "sources": unique_files

        }

    except Exception as e:

        return {
            "error": str(e)
        }
    
@app.get("/chat-history")
def get_chat_history(
    authorization: str = Header(None)
):

    try:

        if not authorization:
            return {
                "error": "Login required"
            }

        user_id = get_user_id(
            authorization
        )

        chats = list(

            chat_collection.find(

                {"user_id": user_id},

                {
                    "_id": 0
                }

            ).sort(
                "created_at",
                1
            )

        )

        return chats

    except Exception as e:

        return {
            "error": str(e)
        }

@app.get("/conversations")
def get_conversations(
    authorization: str = Header(None)
):

    user_id = get_user_id(authorization)

    chats = list(
        chat_collection.aggregate([
            {
                "$match": {
                    "user_id": user_id
                }
            },
            {
                "$group": {
                    "_id": "$conversation_id",
                    "title": {
                        "$first": "$question"
                    }
                }
            }
        ])
    )

    return chats

@app.get("/my-pdfs")
def my_pdfs(
    authorization: str = Header(None)
):

    try:

        user_id = get_user_id(
            authorization
        )

        pdfs = list(

            pdf_collection.find(
                {"user_id": user_id},
                {
                    "_id": 0,
                    "file_name": 1,
                    "upload_date": 1
                }
            ).sort(
                "upload_date",
                -1
            )

        )

        return pdfs

    except Exception as e:

        return {
            "error": str(e)
        }
    
@app.post("/select-pdf/{file_name}")
def select_pdf(
    file_name: str,
    authorization: str = Header(None)
):

    global CURRENT_FILE

    CURRENT_FILE = file_name

    return {
        "message": f"{file_name} selected"
    }

@app.get("/pdf-file/{file_name}")
def get_pdf_file(file_name: str):

    file_path = os.path.join(
        UPLOAD_DIR,
        file_name
    )

    if not os.path.exists(file_path):
        return {"error": "PDF not found"}

    return FileResponse(
        file_path,
        media_type="application/pdf"
    )