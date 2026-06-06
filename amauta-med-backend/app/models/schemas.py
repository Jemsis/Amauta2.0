from typing import List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    user_id: str = Field(..., description="Identificador del usuario que envía el mensaje")
    message: str = Field(..., description="Mensaje enviado por el usuario")
    session_id: Optional[str] = Field(None, description="Id de sesión para historial persistente")


class ChatHistoryItem(BaseModel):
    role: str
    content: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    history: List[ChatHistoryItem]


class SessionResponse(BaseModel):
    session_id: str
    message: str
    history: List[ChatHistoryItem] = []
