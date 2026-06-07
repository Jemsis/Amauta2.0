from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from uuid import uuid4
from typing import List

from .config import settings
from .models.schemas import ChatRequest, ChatResponse, ChatHistoryItem, SessionResponse
from .services.gemini_service import generate_chat_response

app = FastAPI(title="AMAUTA MED Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_STORE: dict[str, dict] = {}

def _create_session(user_id: str) -> str:
    session_id = str(uuid4())
    SESSION_STORE[session_id] = {
        "user_id": user_id,
        "history": [],
    }
    return session_id

def _get_session(session_id: str) -> dict:
    session = SESSION_STORE.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return session

def _append_history(session_id: str, role: str, content: str) -> None:
    session = _get_session(session_id)
    session["history"].append({"role": role, "content": content})

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}

@app.get("/session", response_model=SessionResponse)
async def create_session(user_id: str) -> SessionResponse:
    session_id = _create_session(user_id)
    return SessionResponse(
        session_id=session_id,
        message="Sesión creada con éxito.",
        history=[],
    )

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    session_id = request.session_id or _create_session(request.user_id)
    session = SESSION_STORE.get(session_id)

    if session is None:
        session_id = _create_session(request.user_id)
        session = SESSION_STORE[session_id]

    if session["user_id"] != request.user_id:
        raise HTTPException(
            status_code=400,
            detail="El user_id no coincide con la sesión especificada.",
        )

    _append_history(session_id, "user", request.message)
    history = session["history"].copy()

    try:
        reply = generate_chat_response(request.message, history)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    _append_history(session_id, "assistant", reply)
    updated_history = session["history"]

    return ChatResponse(
        session_id=session_id,
        reply=reply,
        history=[ChatHistoryItem(**item) for item in updated_history],
    )

# IMPORTANTE: StaticFiles debe ir al FINAL
frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")
