from services.email_fetcher import fetch_unread_emails
from services.phishing_detector import detect_phishing

emails = fetch_unread_emails()

for idx, e in enumerate(emails, start=1):
    is_phishing = detect_phishing(e["body"])
    print(f"\n📧 Email #{idx}")
    print(f"From: {e['from']}")
    print(f"Subject: {e['subject']}")
    print(f"Phishing? {'⚠️ YES' if is_phishing else '✅ NO'}")
    print("-" * 50)
