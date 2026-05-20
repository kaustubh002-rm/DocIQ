from dotenv import load_dotenv
load_dotenv()

import os
from datetime import datetime

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.pdf_utils import extract_text_from_pdf
from app.rag_pipeline import create_vector_store, get_qa_chain
from app.database import pdf_collection
from app.models import QuestionRequest

# =========================
# APP INIT
# =========================
app = FastAPI()

print("🔥 FastAPI APP STARTED")

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
async def upload_pdf(file: UploadFile = File(...)):
    global CURRENT_FILE

    try:
        print("🔥 Upload started")

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
            "file_name": file.filename,
            "upload_date": datetime.utcnow(),
            "chunk_count": chunk_count,
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
async def ask_question(request: QuestionRequest):

    try:
        if CURRENT_FILE is None:
            return {"error": "Upload a PDF first"}

        qa_chain = get_qa_chain()
        response = qa_chain.invoke({"input": request.question})

        answer = response["answer"]
        source_docs = response.get("context", [])

        seen = set()
        unique_files = []

        for doc in source_docs:
            fname = doc.metadata.get("file_name", "Unknown")
            if fname not in seen:
                seen.add(fname)
                unique_files.append(fname)

        return {
            "answer": answer,
            "sources": unique_files,
        }

    except Exception as e:
        return {"error": str(e)}