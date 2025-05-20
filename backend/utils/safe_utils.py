import json
import os
import re
import email.header

SAFE_LIST_FILE = "safe_list.json"

def normalize_sender(sender):
    try:
        decoded = email.header.decode_header(sender)
        sender = ''.join([
            part.decode(enc or 'utf-8') if isinstance(part, bytes) else part
            for part, enc in decoded
        ])
    except Exception:
        pass

    sender = re.sub(r'^"|"$', '', sender.strip())
    sender = sender.replace('\\"', '').replace('"', '')

    return sender

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
    normalized_sender = normalize_sender(sender)
    entry = {"sender": normalized_sender, "ip": ip}
    if entry not in safe_list:
        safe_list.append(entry)
        save_safe_list(safe_list)

def remove_from_safe_list(sender, ip):
    safe_list = load_safe_list()
    normalized_sender = normalize_sender(sender)
    safe_list = [entry for entry in safe_list if not (entry["sender"] == normalized_sender or entry["ip"] == ip)]
    save_safe_list(safe_list)

def is_in_safe_list(sender, ip):
    safe_list = load_safe_list()
    normalized_sender = normalize_sender(sender)
    for entry in safe_list:
        if entry["sender"] == normalized_sender or entry["ip"] == ip:
            return True
    return False
