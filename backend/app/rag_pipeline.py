import os
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
COLLECTION_NAME = "pdf_store"
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
    model="llama-3.1-8b-instant",
    temperature=0.3,
    max_tokens=512,
)

# =========================
# SPLITTER
# =========================
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
)

# =========================
# PROMPT
# =========================
RAG_PROMPT = ChatPromptTemplate.from_template(
    """Answer ONLY using context.

Context:
{context}

Question:
{input}

Answer:"""
)

# =========================
# VECTOR STORE
# =========================
def create_vector_store(text: str, file_name: str):

    chunks = text_splitter.split_text(text)

    if not chunks:
        raise ValueError("No text extracted")

    os.makedirs(CHROMA_DB_DIR, exist_ok=True)

    # Load existing vector store
    vector_store = Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_model,
        collection_name=COLLECTION_NAME,
    )

    # ✅ Clear old PDF chunks before adding new ones
    vector_store.delete_collection()

    # ✅ Recreate fresh collection
    vector_store = Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_model,
        collection_name=COLLECTION_NAME,
    )

    # ✅ Add only new PDF chunks
    vector_store.add_texts(
        texts=chunks,
        metadatas=[{"file_name": file_name} for _ in chunks],
    )

    print("✅ CHUNKS:", len(chunks))

    return vector_store, len(chunks)

# =========================
# LOAD VECTOR STORE
# =========================
def load_vector_store():
    return Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_model,
        collection_name=COLLECTION_NAME,
    )

# =========================
# QA CHAIN
# =========================
def get_qa_chain():
    vector_store = load_vector_store()

    retriever = vector_store.as_retriever(search_kwargs={"k": 4})

    doc_chain = create_stuff_documents_chain(llm, RAG_PROMPT)

    return create_retrieval_chain(retriever, doc_chain)

# =========================
# TEST
# =========================
if __name__ == "__main__":
    text = "LangChain is used for building LLM apps."
    create_vector_store(text, "test.pdf")