from bs4 import BeautifulSoup
import re

def clean_email_content(raw_html):
    soup = BeautifulSoup(raw_html, "html.parser")
    text = soup.get_text()
    return re.sub(r"[^a-zA-Z0-9 ]", "", text.lower())
