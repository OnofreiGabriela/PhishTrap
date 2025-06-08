from utils.safe_utils import is_in_safe_list, normalize_sender, remove_from_safe_list
from utils.blacklist_utils import is_in_blacklist
from services.email_classifier import classify_email

def detect_phishing(body, sender, ip):
    sender = normalize_sender(sender)
    ip = ip.strip()

    if ip.upper() == "NOT FOUND":
        ip = ""

    if is_in_blacklist(sender, ip):
        return {"phishing": True}

    if is_in_safe_list(sender, ip):
        return {"phishing": False}

    result = classify_email(body)
    return {"phishing": result["label"] == "Phishing"}
