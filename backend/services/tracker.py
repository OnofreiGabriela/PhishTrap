import json
import os
from datetime import datetime

CLICK_LOG_FILE = "click_events.json"

def handle_tracking_request(token, request):
    data = {
        "token": token,
        "timestamp": datetime.utcnow().isoformat(),
        "ip": request.remote_addr,
        "user_agent": request.headers.get("User-Agent")
    }

    if not os.path.exists(CLICK_LOG_FILE):
        with open(CLICK_LOG_FILE, "w") as f:
            json.dump([data], f, indent=2)
    else:
        with open(CLICK_LOG_FILE, "r+") as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                logs = []
            logs.append(data)
            f.seek(0)
            json.dump(logs, f, indent=2)
