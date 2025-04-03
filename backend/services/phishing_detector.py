import re

SUSPICIOUS_KEYWORDS = {
    "urgency": ["urgent", "immediately", "asap", "act fast", "now"],
    "security": ["verify", "suspended", "reset", "unauthorized", "locked"],
    "finance": ["account", "bank", "billing", "invoice", "credit card"],
    "reward": ["you won", "congratulations", "free gift", "claim", "gratis"],
    "action": ["click here", "login", "update info", "open attachment"],
    "romanian_phish": [
        "gratuit", "cadou", "click aici", "acum", "doar azi",
        "verifică", "urgent", "premiu", "factură", "abonament"
    ]
}

# ✅ Flatten all keywords into one list
ALL_KEYWORDS = [kw for category in SUSPICIOUS_KEYWORDS.values() for kw in category]

def detect_phishing(text):
    text = text.lower()

    matched = [kw for kw in ALL_KEYWORDS if kw in text]
    score = len(matched)
    total = len(ALL_KEYWORDS)
    confidence = round(score / total, 2) if total > 0 else 0.0

    is_phishing = score >= 1

    print("🔍 DEBUG:", {"matched": matched, "score": score, "confidence": confidence, "phishing": is_phishing})

    return {
        "phishing": is_phishing,
        "confidence": confidence,
        "matched_keywords": matched
    }
