import os
import re

os.environ["ANONYMIZED_TELEMETRY"] = "False"

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_groq import ChatGroq

# =========================
# CONFIG
# =========================

CHROMA_DB_DIR = "./chroma_db"

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# =========================
# EMBEDDINGS
# =========================

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# =========================
# LLM
# =========================

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="openai/gpt-oss-120b",
    temperature=0.3,
    max_tokens=512
)

# =========================
# SPLITTER
# =========================

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150
)

# =========================
# PROMPT
# =========================

RAG_PROMPT = ChatPromptTemplate.from_template(
    """
You are a PDF Question Answering Assistant.

Use ONLY the provided context to answer.

Rules:
1. Give a short and clear answer.
2. Do NOT copy large portions of the context.
3. Summarize the information in your own words.
4. If the answer is not present in the context, reply:
   "Answer not found in the uploaded PDF."
5. Keep answers under 150 words.

Context:
{context}

Question:
{input}

Answer:
"""
)

# =========================
# COLLECTION NAME FIX
# =========================

def get_collection_name(file_name: str):

    collection_name = (
        file_name
        .replace(".pdf", "")
        .lower()
    )

    # Replace invalid chars with _
    collection_name = re.sub(
        r"[^a-z0-9_-]",
        "_",
        collection_name
    )

    # Remove duplicate _
    collection_name = re.sub(
        r"_+",
        "_",
        collection_name
    )

    # Remove start/end _
    collection_name = collection_name.strip("_-")

    # Chroma minimum length
    if len(collection_name) < 3:
        collection_name += "_pdf"

    # Chroma maximum length
    collection_name = collection_name[:63]

    return collection_name

# =========================
# VECTOR STORE CREATE
# =========================

def create_vector_store(
    text: str,
    file_name: str
):

    chunks = text_splitter.split_text(text)

    if not chunks:
        raise ValueError("No text extracted")

    collection_name = get_collection_name(
        file_name
    )

    vector_store = Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_model,
        collection_name=collection_name
    )

    vector_store.add_texts(
        texts=chunks,
        metadatas=[
            {
                "file_name": file_name
            }
            for _ in chunks
        ]
    )

    print("📁 Collection:", collection_name)
    print("✅ CHUNKS:", len(chunks))

    return vector_store, len(chunks)

# =========================
# LOAD VECTOR STORE
# =========================

def load_vector_store(
    file_name: str
):

    collection_name = get_collection_name(
        file_name
    )

    return Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_model,
        collection_name=collection_name
    )

# =========================
# QA CHAIN
# =========================

def get_qa_chain(
    file_name: str
):

    vector_store = load_vector_store(
        file_name
    )

    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": 3
        }
    )

    doc_chain = create_stuff_documents_chain(
        llm,
        RAG_PROMPT
    )

    return create_retrieval_chain(
        retriever,
        doc_chain
    )

# =========================
# TEST
# =========================

if __name__ == "__main__":

    text = """
    LangChain is used for building LLM apps.
    """

    create_vector_store(
        text,
        "Object Oriented Programming (1).pdf"
    )