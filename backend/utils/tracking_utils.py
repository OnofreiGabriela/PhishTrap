import uuid
import json
import os

TRACK_LOG_FILE = "tracking_log.json"

def generate_tracking_token():
    return str(uuid.uuid4())

def save_tracking_log(token, sender, ip, original_body):
    print("[DEBUG] Saving tracking log...")
    data = {
        "token": token,
        "sender": sender,
        "ip": ip,
        "status": "bait_sent",
        "original_email": original_body
    }

    with open("tracking_log.json", "a") as f:
        f.write(json.dumps(data) + "\n")
