from fastapi import FastAPI, Request, BackgroundTasks, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field, validator
from typing import Optional, Union
import uvicorn
import datetime
import os
import json
from call_monitor import CallLogReader, FeatureExtractor, BaselineComparator, WellBeingEstimator

app = FastAPI()

# Mount Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# --- Pydantic Models for Validation ---
class LogItem(BaseModel):
    name: str = "Unknown"
    number: Optional[str] = ""
    # Allow string duration from MacroDroid, convert to int
    duration: Union[int, str] = 0
    type: str = "INCOMING"
    timestamp: Optional[str] = Field(default_factory=lambda: datetime.datetime.now().isoformat())

    @validator('duration', pre=True)
    def parse_duration(cls, v):
        # Handle MacroDroid magic text failure (e.g. "[call_duration]")
        if isinstance(v, str):
            clean_v = v.strip()
            # If it's a bracketed tag or empty, return 0
            if clean_v.startswith('[') or not clean_v.replace('.', '', 1).isdigit():
                return 0
            return int(float(clean_v))
        return v

# --- Routes ---

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/webhook")
async def webhook(request: Request):
    """
    Endpoint to receive real call data from MacroDroid/Tasker.
    """
    try:
        # 1. READ RAW BODY
        try:
            raw_body = await request.json()
        except Exception:
            raw_body = (await request.body()).decode()

        print(f"\n--- [DEBUG] INCOMING PAYLOAD ---\n{raw_body}\n--------------------------------")

        # 2. LOG TO FILE (for inspection)
        debug_file = "debug_payloads.json"
        existing_logs = []
        if os.path.exists(debug_file):
            try:
                with open(debug_file, "r") as f:
                    existing_logs = json.load(f)
            except: pass
        
        existing_logs.append({
            "timestamp": datetime.datetime.now().isoformat(),
            "payload": raw_body
        })
        
        with open(debug_file, "w") as f:
            json.dump(existing_logs, f, indent=2)

        # 3. MANUAL VALIDATION / CASTING
        # MacroDroid might send strings for everything. Let's be lenient.
        if isinstance(raw_body, dict):
            # Parse 'duration' safely
            dur = raw_body.get('duration', 0)
            if isinstance(dur, str) and dur.replace('.','',1).isdigit():
                dur = int(float(dur)) # handle "45.0"
            elif not isinstance(dur, (int, float)):
                dur = 0
            
            # Handle name extraction robustly (empty or None -> "Unknown")
            raw_name = raw_body.get('name')
            if not raw_name or str(raw_name).strip() == "":
                final_name = "Unknown"
            else:
                final_name = str(raw_name)

            # Construct cleaned data
            clean_data = {
                "name": final_name,
                "number": str(raw_body.get('number', '')),
                "duration": int(dur),
                "type": str(raw_body.get('type', 'INCOMING')).upper(),
                "timestamp": raw_body.get('timestamp', datetime.datetime.now().isoformat())
            }
            
            # Save Log
            reader = CallLogReader()
            reader.add_fresh_log(clean_data)
            
            return {"status": "success", "message": "Log saved", "debug_payload": raw_body}
            
        return JSONResponse(status_code=400, content={"status": "error", "message": "Body must be JSON object"})

    except Exception as e:
        print(f"Webhook Error: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.get("/api/analyze")
async def analyze():
    # 1. Generate & Read Logs
    reader = CallLogReader()
    reader.read_last_30_days_logs()
    
    # 2. Extract Features
    extractor = FeatureExtractor(reader.get_logs())
    extractor.extract_features()
    
    # 3. Baseline Comparison
    comparator = BaselineComparator(reader.get_logs())
    comparator.compare()
    
    # 4. Estimate Status
    estimator = WellBeingEstimator(
        comparator.get_anomalies(),
        extractor.stats['most_contacted']
    )
    estimator.estimate()
    
    # helper for formatting date strings
    def format_log(log):
        return {
            "name": log.name,
            "type": log.call_type.value,
            "duration": log.duration_sec,
            "date": log.timestamp.strftime("%b %d, %H:%M")
        }

    # Prepare JSON response
    response = {
        "status": estimator.status,
        "reason": estimator.reason,
        "suggestion": estimator.suggestion,
        "metrics": {
            "calls_per_day": extractor.stats['avg_calls_per_day'],
            "avg_duration": extractor.stats['avg_duration_sec'],
            "most_contacted": extractor.stats['most_contacted'][0],
            "recent_count": extractor.stats['recent_7day_count'],
        },
        "time_distribution": extractor.stats['time_dist'],
        "comparison": comparator.comparison_data,
        "recent_logs": [format_log(log) for log in reader.get_logs()[:10]]
    }
    
    return response

if __name__ == '__main__':
    # Run with uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
