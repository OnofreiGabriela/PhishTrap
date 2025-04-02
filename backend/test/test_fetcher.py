from services.email_fetcher import fetch_unread_emails

emails = fetch_unread_emails()
for e in emails:
    print("From:", e["from"])
    print("Subject:", e["subject"])
    print("Body:", e["body"][:100], "...\n")
