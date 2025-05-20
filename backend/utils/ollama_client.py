import requests

def generate_bait_response_ollama(prompt, model="mistral"):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", "No response generated.")
    except Exception as e:
        print(f"[OLLAMA ERROR] {e}")
        return "I'm interested in your offer. Could you please provide more details?"
