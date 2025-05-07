from transformers import BertTokenizer, BertForSequenceClassification
import torch
import torch.nn.functional as F
import os

from pathlib import Path
from transformers import BertTokenizer, BertForSequenceClassification

# Get the root of the project
ROOT_DIR = Path(__file__).resolve().parent.parent.parent

# Adjust based on your actual directory structure
MODEL_PATH = ROOT_DIR / "phishing_email_classifier" / "models" / "scam-email-classifier-bert-uncased"
TOKENIZER_PATH = ROOT_DIR / "phishing_email_classifier" / "models" / "scam-email-bert-tokenizer"

tokenizer = BertTokenizer.from_pretrained(str(TOKENIZER_PATH), local_files_only=True)
model = BertForSequenceClassification.from_pretrained(str(MODEL_PATH), local_files_only=True)

model.eval()

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
        confidence = probs[0, 1].item()  # Probability of class 1 (Phishing)
        predicted_class = torch.argmax(probs, dim=1).item()

    return {
        "label": "Phishing" if predicted_class == 1 else "Legitimate",
        "confidence": confidence
    }
