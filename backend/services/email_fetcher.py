import imaplib
import email
from email.header import decode_header
from email.utils import parsedate_tz, mktime_tz
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

def extract_ip_from_headers(headers):
    # Try Received first
    received = re.search(r"Received: from .*?\[(\d{1,3}(?:\.\d{1,3}){3})\]", headers)
    if received:
        return received.group(1)

    # Try X-Originating-IP
    x_orig = re.search(r"X-Originating-IP: \[(\d{1,3}(?:\.\d{1,3}){3})\]", headers)
    if x_orig:
        return x_orig.group(1)

    return "Not found"

def fetch_emails(limit=100):
    since_date = (datetime.now() - timedelta(days=1)).strftime("%d-%b-%Y")

    mail = imaplib.IMAP4_SSL(SERVER)
    mail.login(EMAIL, APP_PASSWORD)
    mail.select("inbox")

    result, data = mail.search(None, f'(SINCE {since_date})')
    email_ids = data[0].split()[:limit]

    emails = []

    for eid in email_ids:
        result, msg_data = mail.fetch(eid, "(RFC822)")
        raw_data = msg_data[0][1]
        raw = email.message_from_bytes(raw_data)
        headers_str = str(raw)

        date_tuple = email.utils.parsedate_tz(raw["Date"])
        if date_tuple:
            email_datetime = datetime.fromtimestamp(email.utils.mktime_tz(date_tuple))
            if datetime.now() - email_datetime > timedelta(days=1):
                continue

        ip_address = extract_ip_from_headers(headers_str)
        subject = decode_mime_words(raw["Subject"] or "No subject")
        sender = clean_text(raw["From"] or "Unknown sender")

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
            "body": clean_text(body),
            "ip": ip_address
        })


    mail.logout()
    return emails
