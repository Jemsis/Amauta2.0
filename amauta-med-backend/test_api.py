import requests

BASE_URL = "http://127.0.0.1:8000"


def test_health():
    response = requests.get(f"{BASE_URL}/health")
    print("Health status:", response.status_code, response.json())


def test_session():
    payload = {"user_id": "test_user"}
    response = requests.get(f"{BASE_URL}/session", params=payload)
    print("Session creation:", response.status_code, response.json())
    return response.json().get("session_id")


def test_chat(session_id: str | None = None):
    payload = {
        "user_id": "test_user",
        "message": "Hola, necesito ayuda con un síntoma clínico.",
        "session_id": session_id,
    }
    response = requests.post(f"{BASE_URL}/chat", json=payload)
    print("Chat response:", response.status_code, response.json())
    return response.json()


if __name__ == "__main__":
    test_health()
    session_id = test_session()
    test_chat(session_id)
