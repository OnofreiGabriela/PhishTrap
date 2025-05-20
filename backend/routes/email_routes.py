from flask import Blueprint, request, jsonify
from services.email_fetcher import fetch_emails
from services.phishing_detector import detect_phishing
from utils.cleaner import clean_email_content
from utils.safe_utils import add_to_safe_list, remove_from_safe_list
from utils.blacklist_utils import add_to_blacklist, remove_from_blacklist

email_bp = Blueprint("email_bp", __name__)

@email_bp.route('/fetch-analyze', methods=['GET'])
def fetch_and_analyze_emails():
    emails = fetch_emails()
    result = []

    for e in emails:
        cleaned_body = clean_email_content(e.get("body", ""))
        result_data = detect_phishing(cleaned_body, e["from"], e.get("ip", ""))
        result.append({
            "from": e["from"],
            "subject": e["subject"],
            "phishing": result_data["phishing"],
            "ip": e.get("ip", "N/A"),
            "body":  cleaned_body
        })

    return jsonify(result)

@email_bp.route('/check', methods=['POST'])
def check_email():
    content = request.json.get("content", "")
    sender = request.json.get("from", "manual_input")
    ip = request.json.get("ip", "")
    cleaned = clean_email_content(content)
    result = detect_phishing(cleaned, sender, ip)
    return jsonify(result)

@email_bp.route('/mark-safe', methods=['POST'])
def mark_safe():
    data = request.json
    sender = data.get("from")
    ip = data.get("ip")
    if sender and ip:
        add_to_safe_list(sender, ip)
        remove_from_blacklist(sender, ip)
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Missing sender or ip"}), 400

@email_bp.route('/mark-phishing', methods=['POST'])
def mark_phishing():
    data = request.json
    sender = data.get("from")
    ip = data.get("ip")
    if sender and ip:
        add_to_blacklist(sender, ip)
        remove_from_safe_list(sender, ip)
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Missing sender or ip"}), 400