from flask import Blueprint, request, jsonify
from services.email_fetcher import fetch_emails
from services.phishing_detector import detect_phishing
from utils.cleaner import clean_email_content

email_bp = Blueprint("email_bp", __name__)

@email_bp.route('/fetch-analyze', methods=['GET'])
def fetch_and_analyze_emails():
    emails = fetch_emails()
    result = []

    for e in emails:
        detection = detect_phishing(e["body"])
    
        email_result = {
            "from": e["from"],
            "subject": e["subject"],
            "phishing": detection["phishing"]
        }

        if detection["phishing"]:
            email_result["confidence"] = detection["confidence"]

        result.append(email_result)


    return jsonify(result)

@email_bp.route('/check', methods=['POST'])
def check_email():
    content = request.json.get("content", "")
    cleaned = clean_email_content(content)
    result = detect_phishing(cleaned)
    return jsonify(result)