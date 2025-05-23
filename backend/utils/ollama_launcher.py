import subprocess
import requests
import time

OLLAMA_PORT = 11434
OLLAMA_URL = f"http://localhost:{OLLAMA_PORT}"

def is_ollama_running():
    try:
        response = requests.get(OLLAMA_URL)
        return response.status_code == 200
    except:
        return False

def start_ollama():
    if not is_ollama_running():
        print("[INFO] Ollama not running. Starting Ollama server...")
        subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(3)
        print("[INFO] Ollama started.")
    else:
        print("[INFO] Ollama is already running.")
