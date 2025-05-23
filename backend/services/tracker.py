import json
import os
from datetime import datetime, timezone

TRACKING_EVENTS_FILE = "tracking_events.json"

KNOWN_BOTS = [
    "Google-Read-Aloud", "Googlebot", "bingbot", "Discordbot",
    "Yahoo", "crawler", "bot", "spider", "preview"
]

def is_bot(user_agent):
    ua = user_agent.lower()
    return any(bot.lower() in ua for bot in KNOWN_BOTS)

def handle_tracking_request(token, request, event="link_clicked"):
    ip = request.remote_addr
    user_agent = request.headers.get("User-Agent", "Unknown")
    timestamp = datetime.now(timezone.utc)

    if is_bot(user_agent):
        print(f"[INFO] Skipped bot request from {ip}: {user_agent}")
        return

    data = {
        "token": token,
        "ip": ip,
        "user_agent": user_agent,
        "timestamp": timestamp.isoformat(),
        "event": event
    }

    logs = []
    if os.path.exists(TRACKING_EVENTS_FILE):
        with open(TRACKING_EVENTS_FILE, "r") as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                pass

    for entry in logs:
        try:
            if (
                entry["token"] == token and
                entry["ip"] == ip and
                entry["event"] == event
            ):
                past = datetime.fromisoformat(entry["timestamp"])
                if abs((timestamp - past).total_seconds()) < 30:
                    print(f"[INFO] Duplicate tracking skipped for {ip}")
                    return
        except:
            continue

    logs.append(data)

    with open(TRACKING_EVENTS_FILE, "w") as f:
        json.dump(logs, f, indent=2)

def load_tracking_logs():
    if not os.path.exists(TRACKING_EVENTS_FILE):
        return []

    with open(TRACKING_EVENTS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []
