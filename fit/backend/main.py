from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from google_auth_oauthlib.flow import Flow
from config import CLIENT_SECRET_FILE, SCOPES, REDIRECT_URI, BASE_DIR
import os

app = FastAPI(title="Cognia Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Flow
def create_flow():
    return Flow.from_client_secrets_file(
        str(CLIENT_SECRET_FILE),
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Cognia Backend Running"}

@app.get("/auth/google/fit")
def login(request: Request):
    """
    Step 2: Create OAuth Redirect Endpoint
    Builds Google consent URL and redirects user.
    """
    try:
        flow = create_flow()
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        # In a real app, store 'state' to verify later (CSRF protection)
        return RedirectResponse(url=authorization_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/auth/google/fit/callback")
def callback(request: Request, code: str, state: str = None):
    """
    Phase 2 Step 6: Exchange Code for Tokens
    And Step 5 completion.
    """
    try:
        flow = create_flow()
        # method fetch_token exchanges the code for tokens
        flow.fetch_token(code=code)
        
        credentials = flow.credentials
        
        # Store tokens securely (Step 6)
        # For this hackathon scope, we'll save to a local file 'token.json'.
        token_path = BASE_DIR / "token.json"
        with open(token_path, 'w') as token_file:
            token_file.write(credentials.to_json())
            
        # Redirect back to frontend
        return RedirectResponse("http://localhost:5173?connected=true")
    except Exception as e:
        # Redirect to frontend with error
        return RedirectResponse(f"http://localhost:5173?error={str(e)}")

from services.fit_service import sync_data
from services.processing import process_and_validate

@app.post("/sync")
def trigger_sync():
    try:
        raw_data = sync_data()
        quality_report = process_and_validate()
        return {"status": "success", "quality": quality_report}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from services.intelligence import calculate_insights

@app.get("/insights")
def get_insights():
    # Phase 5 Step 12: Fetch Abstracted Insights
    try:
        # Check if data exists, if not try to sync?
        # For now, assumes sync was called.
        report = calculate_insights()
        if not report:
             # Try syncing if no data
             sync_data()
             process_and_validate()
             report = calculate_insights()
             
        if not report:
             raise HTTPException(status_code=404, detail="No analysis available.")
             
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
