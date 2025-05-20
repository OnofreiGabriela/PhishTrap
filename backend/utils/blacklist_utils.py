import json
import os
import re
import email.header

BLACKLIST_FILE = "blacklist.json"
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

def load_blacklist():
    if not os.path.exists(BLACKLIST_FILE):
        return []
    with open(BLACKLIST_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_blacklist(blacklist):
    with open(BLACKLIST_FILE, "w") as f:
        json.dump(blacklist, f, indent=2)

def add_to_blacklist(sender, ip):
    blacklist = load_blacklist()
    normalized_sender = normalize_sender(sender)
    entry = {"sender": normalized_sender, "ip": ip}
    if entry not in blacklist:
        blacklist.append(entry)
        save_blacklist(blacklist)
        remove_from_safe_list(normalized_sender, ip)

def remove_from_blacklist(sender, ip):
    blacklist = load_blacklist()
    normalized_sender = normalize_sender(sender)
    updated = [entry for entry in blacklist if entry["sender"] != normalized_sender and entry["ip"] != ip]
    save_blacklist(updated)

def is_in_blacklist(sender, ip):
    blacklist = load_blacklist()
    normalized_sender = normalize_sender(sender)
    for entry in blacklist:
        if entry["sender"] == normalized_sender or entry["ip"] == ip:
            return True
    return False

def remove_from_safe_list(sender, ip):
    if not os.path.exists(SAFE_LIST_FILE):
        return
    try:
        with open(SAFE_LIST_FILE, "r") as f:
            safe_list = json.load(f)
    except json.JSONDecodeError:
        return

    normalized_sender = normalize_sender(sender)
    updated = [entry for entry in safe_list if entry["sender"] != normalized_sender and entry["ip"] != ip]

    with open(SAFE_LIST_FILE, "w") as f:
        json.dump(updated, f, indent=2)
