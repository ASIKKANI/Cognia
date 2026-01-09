import subprocess
import time
import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
import datetime

# --- Configuration ---
PORT = 8080
POLL_INTERVAL = 1  # Seconds

# --- Persistence ---
DATA_FILE = "screen_time_stats.json"

def load_stats():
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"total_seconds": 0, "last_reset": str(datetime.date.today())}

def save_stats(stats):
    with open(DATA_FILE, "w") as f:
        json.dump(stats, f)

# --- Tracker Logic ---
stats = load_stats()
if stats["last_reset"] != str(datetime.date.today()):
    stats = {"total_seconds": 0, "last_reset": str(datetime.date.today())}

def get_active_app_and_title():
    try:
        # 1. Get App Name
        cmd_app = ['osascript', '-e', 'tell application "System Events" to get name of first process whose frontmost is true']
        app_name = subprocess.check_output(cmd_app).decode('utf-8').strip()
        
        detail = None
        
        # 2. Get Browser Tab Title if applicable
        if app_name == "Google Chrome":
             cmd_tab = ['osascript', '-e', 'tell application "Google Chrome" to get title of active tab of front window']
             detail = subprocess.check_output(cmd_tab).decode('utf-8').strip()
        elif app_name == "Safari":
             cmd_tab = ['osascript', '-e', 'tell application "Safari" to get name of current tab of front window']
             detail = subprocess.check_output(cmd_tab).decode('utf-8').strip()
             
        return app_name, detail
    except Exception:
        return None, None

def track():
    global stats
    while True:
        app_name, detail = get_active_app_and_title()
        
        if app_name:
            stats["total_seconds"] += POLL_INTERVAL
            
            # Track App Usage
            if app_name not in stats["apps"]:
                stats["apps"][app_name] = 0
            stats["apps"][app_name] += POLL_INTERVAL
            
            # Track Specific Website Activity (if browser)
            if detail and (app_name == "Google Chrome" or app_name == "Safari"):
                # Clean up title for better grouping (e.g., "YouTube - ..." -> "YouTube")
                site_name = detail
                if " - " in detail:
                    site_name = detail.split(" - ")[-1] # Often the site name is at end
                
                # Manual overrides for common sites
                lower_detail = detail.lower()
                if "youtube" in lower_detail: site_name = "YouTube"
                elif "github" in lower_detail: site_name = "GitHub"
                elif "mail" in lower_detail: site_name = "Gmail"
                elif "chatgpt" in lower_detail: site_name = "ChatGPT"
                elif "localhost" in lower_detail: site_name = "Local Development"

                if "web_activity" not in stats:
                    stats["web_activity"] = {}
                
                if site_name not in stats["web_activity"]:
                     stats["web_activity"][site_name] = 0
                stats["web_activity"][site_name] += POLL_INTERVAL

            # Daily reset check
            today = str(datetime.date.today())
            if stats["last_reset"] != today:
                stats = {"total_seconds": 0, "last_reset": today, "apps": {}, "web_activity": {}}
            
            if stats["total_seconds"] % 5 == 0: # Save more frequently
                save_stats(stats)
                
        time.sleep(POLL_INTERVAL)

# --- Server Logic ---
class StatsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/stats':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*') # CORS
            self.end_headers()
            self.wfile.write(json.dumps(stats).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        return # Silent logs

def run_server():
    server = HTTPServer(('localhost', PORT), StatsHandler)
    print(f"Cognia Native Bridge running on http://localhost:{PORT}")
    server.serve_forever()

if __name__ == "__main__":
    # Start tracker in background thread
    threading.Thread(target=track, daemon=True).start()
    # Start server
    run_server()
