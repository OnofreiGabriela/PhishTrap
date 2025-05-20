import json
import os

BLACKLIST_FILE = "blacklist.json"
SAFE_LIST_FILE = "safe_list.json"

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
    entry = {"sender": sender, "ip": ip}
    if entry not in blacklist:
        blacklist.append(entry)
        save_blacklist(blacklist)
        remove_from_safe_list(sender, ip)

def is_in_blacklist(sender, ip):
    blacklist = load_blacklist()
    for entry in blacklist:
        if entry["sender"] == sender or entry["ip"] == ip:
            return True
    return False

def remove_from_safe_list(sender, ip):
    if not os.path.exists(SAFE_LIST_FILE):
        return
    with open(SAFE_LIST_FILE, "r") as f:
        try:
            safe_list = json.load(f)
        except json.JSONDecodeError:
            return
    updated = [entry for entry in safe_list if entry["sender"] != sender and entry["ip"] != ip]
    with open(SAFE_LIST_FILE, "w") as f:
        json.dump(updated, f, indent=2)
