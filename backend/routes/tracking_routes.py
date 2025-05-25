from flask import Blueprint, request, jsonify, send_file
from services.tracker import handle_tracking_request, load_tracking_logs
from services.auto_responder import generate_bait_and_send
from utils.blacklist_utils import add_to_blacklist, remove_from_blacklist, is_in_blacklist
from utils.safe_utils import add_to_safe_list, remove_from_safe_list, normalize_sender
from datetime import datetime
import json
import os

tracking_bp = Blueprint("tracking_bp", __name__)

TRACKING_EVENTS_FILE = "tracking_events.json"
PIXEL_PATH = "static/pixel.png"

@tracking_bp.route("/track/<token>", methods=["GET"])
def track_click(token):
    print(f"[TRACK] Link clicked: {token} from IP {request.remote_addr}")
    handle_tracking_request(token, request)
    return "<h1>You already have my email!</h1>", 200

@tracking_bp.route("/track/open", methods=["GET"])
def track_email_open():
    token = request.args.get("token")
    if not token:
        return "Missing token", 400

    from services.tracker import handle_tracking_request
    handle_tracking_request(token, request, event="email_opened")

    return send_file(PIXEL_PATH, mimetype="image/png")

@tracking_bp.route("/send-bait", methods=["POST"])
def send_bait():
    data = request.json
    sender = data.get("from")
    ip = data.get("ip")
    body = data.get("body")
    if not all([sender, ip, body]):
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    try:
        generate_bait_and_send(sender, ip, body)
        return jsonify({"success": True})
    except Exception as e:
        print(f"[ERROR] Failed to generate bait: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@tracking_bp.route("/mark-phishing", methods=["POST"])
def mark_phishing():
    data = request.json
    sender = data.get("from")
    ip = data.get("ip")

    if sender and ip:
        norm_sender = normalize_sender(sender)
        add_to_blacklist(norm_sender, ip)
        remove_from_safe_list(norm_sender, ip)
        return jsonify({"success": True})

    return jsonify({"success": False, "error": "Missing sender or ip"}), 400

@tracking_bp.route("/mark-safe", methods=["POST"])
def mark_safe():
    data = request.json
    sender = data.get("from")
    ip = data.get("ip")

    if sender and ip:
        norm_sender = normalize_sender(sender)
        add_to_safe_list(norm_sender, ip)
        remove_from_blacklist(norm_sender, ip)
        return jsonify({"success": True})

    return jsonify({"success": False, "error": "Missing sender or ip"}), 400

@tracking_bp.route("/get-baited-attackers", methods=["GET"])
def get_baited_attackers():
    try:
        with open("tracking_events.json", "r") as f:
            try:
                event_data = json.load(f)
            except json.JSONDecodeError:
                event_data = []

        bait_data = []
        if os.path.exists("tracking_log.json"):
            with open("tracking_log.json", "r") as f:
                for line in f:
                    try:
                        bait_data.append(json.loads(line.strip()))
                    except json.JSONDecodeError:
                        continue

        for event in event_data:
            matching_bait = next((b for b in bait_data if b.get("token") == event.get("token")), None)
            if matching_bait:
                event["original_email"] = matching_bait.get("original_email", "No original content recorded.")

        return jsonify(event_data)

    except Exception as e:
        print(f"[ERROR] Failed to load baited attackers: {e}")
        return jsonify({"error": "Failed to load tracking logs"}), 500

@tracking_bp.route("/get-safe-list", methods=["GET"])
def get_safe_list():
    try:
        with open('safe_list.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        print(f"[ERROR] Failed to load safe list: {e}")
        return jsonify({"error": "Failed to load safe list"}), 500

@tracking_bp.route("/get-blacklist", methods=["GET"])
def get_blacklist():
    try:
        with open('blacklist.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        print(f"[ERROR] Failed to load blacklist: {e}")
        return jsonify({"error": "Failed to load blacklist"}), 500

@tracking_bp.route("/remove-from-safe", methods=["POST"])
def remove_from_safe():
    data = request.json
    sender = data.get("sender")
    ip = data.get("ip")

    if not sender or not ip:
        return jsonify({"success": False, "error": "Missing sender or IP"}), 400

    try:
        with open('safe_list.json', 'r+') as f:
            entries = json.load(f)
            updated = [e for e in entries if not (e['sender'] == sender and e['ip'] == ip)]
            f.seek(0)
            f.truncate()
            json.dump(updated, f, indent=2)
        return jsonify({"success": True})
    except Exception as e:
        print(f"[ERROR] Failed to remove from safe list: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@tracking_bp.route("/remove-from-blacklist", methods=["POST"])
def remove_from_blacklist():
    data = request.json
    sender = data.get("sender")
    ip = data.get("ip")

    if not sender or not ip:
        return jsonify({"success": False, "error": "Missing sender or IP"}), 400

    try:
        with open('blacklist.json', 'r+') as f:
            entries = json.load(f)
            updated = [e for e in entries if not (e['sender'] == sender and e['ip'] == ip)]
            f.seek(0)
            f.truncate()
            json.dump(updated, f, indent=2)
        return jsonify({"success": True})
    except Exception as e:
        print(f"[ERROR] Failed to remove from blacklist: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@tracking_bp.route("/delete-baited-attacker/<token>", methods=["DELETE"])
def delete_baited_attacker(token):
    if not os.path.exists(TRACKING_EVENTS_FILE):
        return jsonify({"error": "No tracking events found"}), 404

    try:
        with open(TRACKING_EVENTS_FILE, "r+") as f:
            logs = json.load(f)
            updated_logs = [entry for entry in logs if entry.get("token") != token]
            f.seek(0)
            f.truncate()
            json.dump(updated_logs, f, indent=2)

        return jsonify({"success": True})
    except Exception as e:
        print(f"[ERROR] Failed to delete attacker entry: {e}")
        return jsonify({"error": "Failed to delete attacker entry"}), 500
