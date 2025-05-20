# import re

# SUSPICIOUS_KEYWORDS = {
#     "urgency": ["urgent", "immediately", "asap", "act fast", "now"],
#     "security": ["verify", "suspended", "reset", "unauthorized", "locked"],
#     "finance": ["account", "bank", "billing", "invoice", "credit card"],
#     "reward": ["you won", "congratulations", "free gift", "claim", "gratis"],
#     "action": ["click here", "login", "update info", "open attachment"],
#     "romanian_phish": [
#         "gratuit", "cadou", "click aici", "acum", "doar azi",
#         "verifică", "urgent", "premiu", "factură", "abonament"
#     ]
# }

# ALL_KEYWORDS = [kw for category in SUSPICIOUS_KEYWORDS.values() for kw in category]

# def detect_phishing(text):
#     text = text.lower()
#     matched = []

#     category_hits = 0
#     for category, keywords in SUSPICIOUS_KEYWORDS.items():
#         category_match = False
#         for word in keywords:
#             if word in text:
#                 matched.append(word)
#                 category_match = True
#         if category_match:
#             category_hits += 1

#     confidence = round(category_hits / len(SUSPICIOUS_KEYWORDS), 2)
#     is_phishing = confidence >= 0.3

#     return {
#         "phishing": is_phishing,
#         "confidence": confidence,
#         "matched_keywords": matched
#     }

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
