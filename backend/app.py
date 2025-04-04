from flask import Flask
from flask_cors import CORS
from routes.email_routes import email_bp

app = Flask(__name__)
CORS(app)  # Allow frontend to connect (port 3000 → 5000)

app.register_blueprint(email_bp, url_prefix="/api/email")

if __name__ == "__main__":
    app.run(debug=True)
