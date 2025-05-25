from dotenv import load_dotenv

load_dotenv(dotenv_path='.env')


from flask import Flask
from flask_cors import CORS
from routes.email_routes import email_bp
from routes.tracking_routes import tracking_bp
from utils.ollama_launcher import start_ollama, stop_ollama
import signal
import sys

start_ollama()

app = Flask(__name__)
CORS(app)  # Allow frontend to connect (port 3000 → 5000)

app.register_blueprint(email_bp, url_prefix="/api/email")
app.register_blueprint(tracking_bp, url_prefix="/api")

def handle_exit(signum, frame):
    print("[INFO] Shutting down backend and Ollama...")
    stop_ollama()
    sys.exit(0)

signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)

if __name__ == "__main__":
    app.run(debug=True)
