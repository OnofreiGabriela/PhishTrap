from flask import Blueprint, request, jsonify
from services.tracker import handle_tracking_request, load_tracking_logs
from services.auto_responder import generate_bait_and_send
from utils.blacklist_utils import add_to_blacklist, remove_from_blacklist, is_in_blacklist
from utils.safe_utils import add_to_safe_list, remove_from_safe_list, normalize_sender

tracking_bp = Blueprint("tracking_bp", __name__)

@tracking_bp.route("/track/<token>", methods=["GET"])
def track_click(token):
    handle_tracking_request(token, request)
    return "<h1>Thank you for your response!</h1>", 200

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
        data = load_tracking_logs()
        return jsonify(data)
    except Exception as e:
        print(f"[ERROR] Failed to load baited attackers: {e}")
        return jsonify({"error": "Failed to load tracking logs"}), 500
