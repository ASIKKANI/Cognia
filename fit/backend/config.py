import os
import json
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent
CLIENT_SECRET_FILE = BASE_DIR / "client_secret.json"

# Verify secret exists
if not CLIENT_SECRET_FILE.exists():
    raise FileNotFoundError(f"Client secret file not found at {CLIENT_SECRET_FILE}")

# Load secret to get client config (optional, but good for validation)
with open(CLIENT_SECRET_FILE, 'r') as f:
    CLIENT_CONFIG = json.load(f)

# OAuth Scopes
SCOPES = [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.sleep.read",
    "https://www.googleapis.com/auth/fitness.heart_rate.read",
    "https://www.googleapis.com/auth/calendar.readonly"
]

# Redirect URI (Must match what's in the Google Cloud Console)
# Usually for local dev it's http://localhost:8000/auth/google/fit/callback or similar
# The user specified the callback endpoint as: /auth/google/fit/callback
REDIRECT_URI = "http://localhost:8000/auth/google/fit/callback"
