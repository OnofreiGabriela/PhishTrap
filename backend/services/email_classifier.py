from transformers import BertTokenizer, BertForSequenceClassification
import torch
import torch.nn.functional as F
import os

from pathlib import Path
from transformers import BertTokenizer, BertForSequenceClassification

ROOT_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = ROOT_DIR / "phishing_email_classifier" / "models" / "scam-email-classifier-bert-uncased"
TOKENIZER_PATH = ROOT_DIR / "phishing_email_classifier" / "models" / "scam-email-bert-tokenizer"

tokenizer = BertTokenizer.from_pretrained(str(TOKENIZER_PATH), local_files_only=True)
model = BertForSequenceClassification.from_pretrained(str(MODEL_PATH), local_files_only=True)

model.eval()

import re

def clean_email_text(text):
    text = text.lower()
    text = re.sub(r"http\S+", "[URL]", text)
    text = re.sub(r"\S+@\S+", "[EMAIL]", text)
    text = re.sub(r"[^a-zA-Z0-9\s\[\]]", "", text)
    return text.strip()


def classify_email(text):
    inputs = tokenizer(
        text,
        truncation=True,
        max_length=512,
        padding=True,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = F.softmax(logits, dim=1)
        predicted_class = torch.argmax(probs, dim=1).item()

    is_phishing = predicted_class == 1
    return {
        "phishing": is_phishing
    }
