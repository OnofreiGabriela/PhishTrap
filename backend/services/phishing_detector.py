def detect_phishing(text):
    suspicious_keywords = ["urgent", "verify", "account locked", "click here"]
    return any(word in text for word in suspicious_keywords)
