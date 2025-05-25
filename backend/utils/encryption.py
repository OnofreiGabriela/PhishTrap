from cryptography.fernet import Fernet
import os

MASTER_KEY = os.getenv("PHISHTRAP_MASTER_KEY")
if MASTER_KEY is None:
    raise ValueError("PHISHTRAP_MASTER_KEY is missing from environment. Please check your .env file.")

fernet = Fernet(MASTER_KEY)

def encrypt_data(data: str) -> bytes:
    return fernet.encrypt(data.encode())

def decrypt_data(token: bytes) -> str:
    return fernet.decrypt(token).decode()
