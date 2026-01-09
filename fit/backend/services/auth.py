import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from config import BASE_DIR

TOKEN_FILE = BASE_DIR / "token.json"

def get_credentials():
    if not TOKEN_FILE.exists():
        return None
    
    with open(TOKEN_FILE, 'r') as f:
        data = json.load(f)
        creds = Credentials.from_authorized_user_info(data)
    
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())
            
    return creds
