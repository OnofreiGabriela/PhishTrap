import json
import os
from datetime import datetime

TRACKING_EVENTS_FILE = "tracking_events.json"

def handle_tracking_request(token, request):
    ip = request.remote_addr
    user_agent = request.headers.get("User-Agent", "Unknown")
    timestamp = datetime.utcnow().isoformat()

    data = {
        "token": token,
        "ip": ip,
        "user_agent": user_agent,
        "timestamp": timestamp
    }

    if not os.path.exists(TRACKING_EVENTS_FILE):
        with open(TRACKING_EVENTS_FILE, "w") as f:
            json.dump([data], f, indent=2)
    else:
        with open(TRACKING_EVENTS_FILE, "r+") as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                logs = []
            logs.append(data)
            f.seek(0)
            json.dump(logs, f, indent=2)

def load_tracking_logs():
    if not os.path.exists(TRACKING_EVENTS_FILE):
        return []

    with open(TRACKING_EVENTS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []
