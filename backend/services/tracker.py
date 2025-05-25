import json
import os
import requests
from datetime import datetime, timezone

TRACKING_EVENTS_FILE = "tracking_events.json"

KNOWN_BOTS = [
    "Google-Read-Aloud", "Googlebot", "bingbot", "Discordbot",
    "Yahoo", "crawler", "bot", "spider", "preview"
]

KNOWN_VPN_ASNS = ['AS9009', 'AS174', 'AS20052']
KNOWN_VPN_NAMES = ['NordVPN', 'ExpressVPN', 'ProtonVPN', 'Surfshark']

def query_ipwho(ip):
    try:
        r = requests.get(f"https://ipwho.is/{ip}", timeout=5)
        return r.json()
    except:
        return {}

def query_ipapi(ip):
    try:
        r = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
        return r.json()
    except:
        return {}

def query_freegeoip(ip):
    try:
        r = requests.get(f"https://freegeoip.app/json/{ip}", timeout=5)
        return r.json()
    except:
        return {}

def combine_ip_info(ip):
    data_who = query_ipwho(ip)
    data_api = query_ipapi(ip)
    data_freegeo = query_freegeoip(ip)

    combined = {
        "country": data_who.get("country") or data_api.get("country") or data_freegeo.get("country_name"),
        "region": data_who.get("region") or data_api.get("regionName") or data_freegeo.get("region_name"),
        "city": data_who.get("city") or data_api.get("city") or data_freegeo.get("city"),
        "isp": data_who.get("connection", {}).get("isp") or data_api.get("isp"),
        "org": data_who.get("connection", {}).get("organization") or data_api.get("org"),
        "as": data_who.get("connection", {}).get("asn") or data_api.get("as") or data_freegeo.get("asn"),
        "mobile": data_who.get("connection", {}).get("mobile"),
        "proxy": data_who.get("connection", {}).get("proxy", False),
        "vpn": data_who.get("connection", {}).get("vpn", False),
        "tor": data_who.get("connection", {}).get("tor", False),
    }

    return combined

def check_if_vpn(asn, isp, org):
    return (
        str(asn) in KNOWN_VPN_ASNS or
        any(name.lower() in (isp or '').lower() for name in KNOWN_VPN_NAMES) or
        any(name.lower() in (org or '').lower() for name in KNOWN_VPN_NAMES)
    )

def is_bot(user_agent):
    ua = user_agent.lower()
    return any(bot.lower() in ua for bot in KNOWN_BOTS)

def handle_tracking_request(token, request, event="link_clicked"):
    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()
    user_agent = request.headers.get("User-Agent", "Unknown")
    timestamp = datetime.now(timezone.utc)

    if is_bot(user_agent):
        print(f"[INFO] Skipped bot request from {ip}: {user_agent}")
        return

    geo_info = combine_ip_info(ip)
    suspected_vpn = check_if_vpn(geo_info.get("as"), geo_info.get("isp"), geo_info.get("org"))

    data = {
        "token": token,
        "ip": ip,
        "user_agent": user_agent,
        "timestamp": timestamp.isoformat(),
        "event": event,
        **geo_info,
        "suspected_vpn": suspected_vpn
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
