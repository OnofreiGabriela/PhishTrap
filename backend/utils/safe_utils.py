import json
import os

SAFE_LIST_FILE = "safe_list.json"

def load_safe_list():
    if not os.path.exists(SAFE_LIST_FILE):
        return []
    with open(SAFE_LIST_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_safe_list(safe_list):
    with open(SAFE_LIST_FILE, "w") as f:
        json.dump(safe_list, f, indent=2)

def add_to_safe_list(sender, ip):
    safe_list = load_safe_list()

    entry = {"sender": sender, "ip": ip}
    if entry not in safe_list:
        safe_list.append(entry)
        save_safe_list(safe_list)

def is_in_safe_list(sender, ip):
    safe_list = load_safe_list()
    for entry in safe_list:
        if entry["sender"] == sender or entry["ip"] == ip:
            return True
    return False
