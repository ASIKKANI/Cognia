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

def get_active_app():
    try:
        # AppleScript to get the frontmost application name
        cmd = ['osascript', '-e', 'tell application "System Events" to get name of first process whose frontmost is true']
        output = subprocess.check_output(cmd).decode('utf-8').strip()
        return output
    except Exception:
        return None

def track():
    global stats
    while True:
        app = get_active_app()
        if app:
            # We count time whenever ANY app is active (user is at computer)
            # You could filter specifically for browsers or productivity apps here
            stats["total_seconds"] += POLL_INTERVAL
            
            # Daily reset check
            today = str(datetime.date.today())
            if stats["last_reset"] != today:
                stats = {"total_seconds": 0, "last_reset": today}
            
            if stats["total_seconds"] % 10 == 0: # Save every 10 seconds
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
