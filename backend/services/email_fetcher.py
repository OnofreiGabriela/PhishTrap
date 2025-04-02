import imaplib
import email
from email.header import decode_header
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

EMAIL = os.getenv("EMAIL_USER")
APP_PASSWORD = os.getenv("EMAIL_PASS")
SERVER = "imap.gmail.com"

def decode_mime_words(s):
    decoded_parts = decode_header(s)
    result = ''
    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            try:
                result += part.decode(encoding or 'utf-8', errors='ignore')
            except:
                result += part.decode('latin-1', errors='ignore')
        else:
            result += part
    return result

def clean_text(text):
    return re.sub(r'\s+', ' ', text.strip())

def fetch_unread_emails(limit=100):
    # Calculate date 7 days ago
    since_date = (datetime.now() - timedelta(days=1)).strftime("%d-%b-%Y")  # Format: 01-Jan-2024

    mail = imaplib.IMAP4_SSL(SERVER)
    mail.login(EMAIL, APP_PASSWORD)
    mail.select("inbox")

    # Search: Unread AND received since 7 days ago
    result, data = mail.search(None, f'(UNSEEN SINCE {since_date})')
    email_ids = data[0].split()[:limit]  # Limit to first 10

    emails = []

    for eid in email_ids:
        result, msg_data = mail.fetch(eid, "(RFC822)")
        raw = email.message_from_bytes(msg_data[0][1])

        subject = decode_mime_words(raw["Subject"])
        sender = raw["From"]

        body = ""
        if raw.is_multipart():
            for part in raw.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                    break
        else:
            body = raw.get_payload(decode=True).decode("utf-8", errors="ignore")

        emails.append({
            "from": clean_text(sender),
            "subject": clean_text(subject),
            "body": clean_text(body)
        })

    mail.logout()
    return emails
