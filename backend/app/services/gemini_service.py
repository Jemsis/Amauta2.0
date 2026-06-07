import logging
from pathlib import Path
from typing import List

# ✅ Cambiado: de 'app.chains.chat_chain' a '.chains.chat_chain' (pero como está en services, necesita '..' para subir a app)
from ..chains.chat_chain import build_chat_chain

BASE_DIR = Path(__file__).resolve().parent.parent.parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge"
SYSTEM_PROMPT_FILE = KNOWLEDGE_DIR / "system_prompt.txt"


def load_text_file(path: Path) -> str:
    if not path.exists():
        return ""

    try:
        return path.read_text(encoding="utf-8").strip()
    except Exception as exc:
        logging.error("Error al leer %s: %s", path, exc)
        return ""


def load_all_knowledge_files(directory: Path) -> str:
    """Carga SOLO el archivo de conocimiento más pequeño para no exceder tokens."""
    
    # Lista de archivos en orden de preferencia (el más pequeño y relevante primero)
    priority_files = [
        "AMAUTA_KB_SUPLEMENTARIO_SALUD_PUBLICA.txt",  # 13KB - información complementaria
        "AMAUTA_SP_v9_4_3_FINAL.txt",                 # 63KB - información de sistema
        "clinical_data.txt",                          # 390KB - solo si no hay otros
    ]
    
    # Intentar cargar el primer archivo que exista
    for filename in priority_files:
        filepath = directory / filename
        if filepath.exists():
            try:
                content = filepath.read_text(encoding="utf-8").strip()
                if content:
                    # Limitar a 4000 caracteres como seguridad extra
                    if len(content) > 4000:
                        content = content[:4000] + "..."
                    return f"=== Base de conocimiento AMAUTA ===\n{content}"
            except Exception as exc:
                logging.error("Error al leer %s: %s", filepath, exc)
    
    # Si no encuentra ninguno, intentar con cualquier .txt
    for filepath in directory.glob("*.txt"):
        if filepath.name == "system_prompt.txt":
            continue
        try:
            content = filepath.read_text(encoding="utf-8").strip()
            if content:
                if len(content) > 4000:
                    content = content[:4000] + "..."
                return f"=== Base de conocimiento ===\n{content}"
        except Exception as exc:
            logging.error("Error al leer %s: %s", filepath, exc)
    
    return "No se encontró información médica disponible."


def build_history_text(history: List[dict]) -> str:
    if not history:
        return "Sin historial previo."

    return "\n".join([f"{item['role'].capitalize()}: {item['content']}" for item in history])


def generate_chat_response(user_message: str, session_history: List[dict]) -> str:
    system_prompt = load_text_file(SYSTEM_PROMPT_FILE)
    if not system_prompt:
        system_prompt = (
            "Eres AMAUTA MED, un asistente médico avanzado de Perú. Actúas como un médico experto. "
            "Tus respuestas deben ser profesionales, basadas en guías MINSA y literatura médica actual. "
            "Responde de forma estructurada."
        )

    clinical_data = load_all_knowledge_files(KNOWLEDGE_DIR)
    history_text = build_history_text(session_history)

    chain = build_chat_chain()
    try:
        return chain.invoke({
            "system_prompt": system_prompt,
            "clinical_data": clinical_data,
            "history": history_text,
            "user_message": user_message,
        })
    except Exception as exc:
        logging.error("Error al generar respuesta de Groq: %s", exc)
        raise


class GeminiPromptService:
    """Clase mantenida por compatibilidad. Ahora usa Groq internamente."""
    def create_completion(self, prompt: str) -> str:
        # ✅ Cambiado: importación relativa también aquí
        from ..chains.chat_chain import GroqLLM
        llm = GroqLLM()
        return llm._call(prompt)