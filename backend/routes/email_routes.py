from flask import Blueprint, request, jsonify
from services.phishing_detector import detect_phishing
from utils.cleaner import clean_email_content

email_bp = Blueprint("email_bp", __name__)

@email_bp.route("/check", methods=["POST"])
def check_email():
    content = request.json.get("content", "")
    cleaned = clean_email_content(content)
    is_phishing = detect_phishing(cleaned)
    return jsonify({ "phishing": is_phishing })
