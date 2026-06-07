import requests
from langchain_core.language_models.llms import LLM
from langchain_core.prompts import PromptTemplate
from typing import Any, List, Mapping, Optional

# ✅ Cambiado: de 'app.config' a '..config' (sube un nivel de chains/ a app/)
from ..config import settings


class GroqLLM(LLM):
    """Adaptador simple para usar Groq con LangChain vía peticiones REST."""

    @property
    def _llm_type(self) -> str:
        return "groq"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.groq_model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "temperature": 0.2,
        }
        try:
            response = requests.post(url, json=payload, headers=headers)
            if not response.ok:
                raise Exception(
                    f"Error de la API de Groq: {response.status_code} - {response.text}"
                )
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as exc:
            raise Exception(f"Fallo al contactar con Groq: {exc}")

    @property
    def _identifying_params(self) -> Mapping[str, Any]:
        return {"model_name": settings.groq_model}


def build_chat_chain():
    template = """{system_prompt}

Datos clínicos relevantes de la base de conocimiento de AMAUTA MED:
{clinical_data}

Historial de chat:
{history}

Pregunta o caso clínico:
{user_message}

Responde como un médico experto de AMAUTA MED, basándote en la base de conocimiento y en las guías del MINSA. Mantén un tono profesional, claro y estructurado en español."""

    prompt = PromptTemplate(
        input_variables=["system_prompt", "clinical_data", "history", "user_message"],
        template=template,
    )

    # Retorna un Runnable de LangChain (prompt | llm) utilizando LCEL
    return prompt | GroqLLM()
