import subprocess
import requests
import time
import psutil

OLLAMA_PORT = 11434
OLLAMA_URL = f"http://localhost:{OLLAMA_PORT}"
OLLAMA_PROCESS_NAME = "ollama"

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

def stop_ollama():
    for proc in psutil.process_iter(['pid', 'name']):
        if OLLAMA_PROCESS_NAME in proc.info['name'].lower():
            try:
                proc.terminate()
                print(f"[INFO] Terminated Ollama process (PID: {proc.info['pid']})")
            except Exception as e:
                print(f"[ERROR] Could not terminate Ollama (PID: {proc.info['pid']}): {e}")
