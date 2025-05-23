from flask import Flask
from flask_cors import CORS
from routes.email_routes import email_bp
from routes.tracking_routes import tracking_bp
from utils.ollama_launcher import start_ollama

start_ollama()

app = Flask(__name__)
CORS(app)  # Allow frontend to connect (port 3000 → 5000)

app.register_blueprint(email_bp, url_prefix="/api/email")
app.register_blueprint(tracking_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
