import uuid
import os
from utils.tracking_utils import save_tracking_log
import smtplib
from email.mime.text import MIMEText
from utils.ollama_client import generate_bait_response_ollama


SMTP_SERVER = "smtp.gmail.com"  
SMTP_PORT = 587
SMTP_USERNAME =  os.getenv("EMAIL_USER")      
SMTP_PASSWORD = os.getenv("EMAIL_PASS")  


def send_email(to_address, subject, body):
    msg = MIMEText(body, "html")
    msg["Subject"] = subject
    msg["From"] = SMTP_USERNAME
    msg["To"] = to_address

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        print(f"[INFO] Email sent to {to_address}")

def generate_token():
    return str(uuid.uuid4())

def create_tracking_link(token):
    return f" https://c4a1-86-124-142-241.ngrok-free.app/api/track/{token}"

def generate_bait_response(original_body):
    prompt = f"Write a natural, curious maybe even naive email reply, and replace the sign off with my intials, X, to this suspicious message:\n\n{original_body}"
    return generate_bait_response_ollama(prompt)

def generate_bait_and_send(sender, ip, original_body):
    bait_email = prepare_bait_email(sender, ip, original_body)

    send_email(
        to_address=bait_email["to"],
        subject=bait_email["subject"],
        body=bait_email["body"]
    )


def prepare_bait_email(sender, ip, original_body):
    token = generate_token()
    tracking_link = create_tracking_link(token)

    bait_reply = generate_bait_response(original_body)

    formatted_body = bait_reply.replace('\n', '<br>')

    response_content = f"""
    <p style="font-size:15px;">
    {formatted_body}
    My contact info <a href="{tracking_link}" style="color:#007bff;text-decoration:none;">click here</a>.
    <img src="https://c4a1-86-124-142-241.ngrok-free.app/api/track/open?token={token}" 
        alt="" width="1" height="1" style="display:none;">
    </p>

    """

    save_tracking_log(token, sender, ip, original_body)

    return {
        "to": sender,
        "subject": "Re: Your recent email",
        "body": response_content
    }
