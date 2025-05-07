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

from services.email_classifier import classify_email

def detect_phishing(text):
    """
    Use fine-tuned BERT to classify text.
    """
    result = classify_email(text)
    return {
        "phishing": result["label"] == "Phishing",
        "confidence": round(result["confidence"], 2),
        "matched_keywords": []  # keep key for backward compatibility
    }
