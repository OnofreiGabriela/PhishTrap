import json
import os
from utils.encryption import encrypt_data, decrypt_data

CONFIG_FILE = "config.json"

def save_config(data):
    try:
        json_str = json.dumps(data)
        encrypted = encrypt_data(json_str)
        with open(CONFIG_FILE, "wb") as f:
            f.write(encrypted)
        print("[INFO] Encrypted config saved.")
    except Exception as e:
        print(f"[ERROR] Failed to save encrypted config: {e}")

def load_config():
    if not os.path.exists(CONFIG_FILE):
        print("[ERROR] Config file not found.")
        return None
    try:
        with open(CONFIG_FILE, "rb") as f:
            encrypted = f.read()
        json_str = decrypt_data(encrypted)
        return json.loads(json_str)
    except Exception as e:
        print(f"[ERROR] Failed to load encrypted config: {e}")
        return None
