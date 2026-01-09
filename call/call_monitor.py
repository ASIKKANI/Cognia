import random
from datetime import datetime, timedelta
import enum
import time

# ==========================================
# HACKATHON PROTOTYPE: MENTAL WELL BEING MONITOR
# ==========================================

# ====================
# DATA MODELS
# ====================

class CallType(enum.Enum):
    INCOMING = "INCOMING"
    OUTGOING = "OUTGOING"
    MISSED = "MISSED"

class CallLogEntry:
    def __init__(self, name, number, timestamp, duration_sec, call_type):
        self.name = name
        self.number = number
        self.timestamp = timestamp
        self.duration_sec = duration_sec
        self.call_type = call_type

    def __repr__(self):
        # Format: [Date Time] Type | Name (Duration)
        time_str = self.timestamp.strftime('%Y-%m-%d %H:%M')
        return f"[{time_str}] {self.call_type.value.ljust(8)} | {self.name} ({self.duration_sec}s)"

# ====================
# 1. CALL LOG READER
# ====================

class CallLogReader:
    def __init__(self):
        self.logs = []

import json
import os

# ... (Enums and CallLogEntry remain same) ...

class CallLogReader:
    def __init__(self):
        self.logs = []
        self.REAL_LOGS_FILE = "real_call_logs.json"

    def read_last_30_days_logs(self):
        """
        Reads logs. 
        STRATEGY: 
        1. Generate synthetic 30-day history (so the Dashboard isn't empty).
        2. Load REAL logs received via Webhook and overlay them.
        """
        self.logs = []
        
        # 1. Generate Synthetic History (Baseline)
        self._generate_synthetic_history()

        # 2. Load Real Logs (if any)
        real_logs = self._load_real_logs()
        if real_logs:
            print(f"Merged {len(real_logs)} REAL logs from device.")
            self.logs.extend(real_logs)
            
        # Sort desc
        self.logs.sort(key=lambda x: x.timestamp, reverse=True)

    def add_fresh_log(self, data):
        """Receives a single log dict from Webhook/API and saves it."""
        # data format: {'name': 'X', 'number': 'Y', 'duration': 123, 'type': 'INCOMING', 'timestamp': 'ISO_STR'}
        
        existing_data = []
        if os.path.exists(self.REAL_LOGS_FILE):
             with open(self.REAL_LOGS_FILE, 'r') as f:
                try: 
                    existing_data = json.load(f)
                except: pass
        
        existing_data.append(data)
        
        with open(self.REAL_LOGS_FILE, 'w') as f:
            json.dump(existing_data, f, indent=2)
            
        print(f"★ NEW REAL LOG SAVED: {data.get('name')}")

    def _load_real_logs(self):
        if not os.path.exists(self.REAL_LOGS_FILE):
            return []
            
        logs = []
        with open(self.REAL_LOGS_FILE, 'r') as f:
            try:
                raw_list = json.load(f)
                for item in raw_list:
                    # Parse Timestamp
                    try:
                        ts = datetime.fromisoformat(item['timestamp'])
                    except:
                        ts = datetime.now() # Fallback
                    
                    # Parse Type
                    ctype = CallType.INCOMING
                    if 'OUT' in item['type'].upper(): ctype = CallType.OUTGOING
                    if 'MISS' in item['type'].upper(): ctype = CallType.MISSED
                    
                    entry = CallLogEntry(
                        item['name'], 
                        item.get('number', ''), 
                        ts, 
                        int(item.get('duration', 0)), 
                        ctype
                    )
                    logs.append(entry)
            except Exception as e:
                print(f"Error loading real logs: {e}")
        return logs

    def _generate_synthetic_history(self):
        print("Generating synthetic baseline history...")
        # Synthetic contacts
        contacts = [
            ("Mom", "+919876543210"),
            ("Rahul (Best Friend)", "+919876543211"),
            ("Work Manager", "+919876543212"),
            ("Pizza Place", "+919876543213")
        ]
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        current_date = start_date
        while current_date <= end_date:
            # Skip today for synthetic data so REAL data shines today
            if current_date.date() == datetime.today().date():
                break

            num_calls = random.choice([0, 1, 2, 3, 5])
            for _ in range(num_calls):
                contact_name, contact_number = random.choice(contacts)
                hour = random.randint(9, 21)
                minute = random.randint(0, 59)
                call_time = current_date.replace(hour=hour, minute=minute)
                call_type = random.choice([CallType.INCOMING, CallType.INCOMING, CallType.OUTGOING])
                duration = int(random.expovariate(1/300))
                if duration == 0: duration = 15
                
                entry = CallLogEntry(contact_name, contact_number, call_time, duration, call_type)
                self.logs.append(entry)
            
            current_date += timedelta(days=1)

    def get_logs(self):
        return self.logs

    def show_sample_logs(self, count=5):
        print(f"\n--- SAMPLE CALL LOGS (Most Recent {count}) ---")
        for i, log in enumerate(self.logs[:count]):
            print(f"{i+1}. {log}")

# ====================
# 2. FEATURE EXTRACTION
# ====================

class FeatureExtractor:
    def __init__(self, logs):
        self.logs = logs
        self.stats = {}

    def extract_features(self):
        print("\nExtracting features from logs...")
        if not self.logs:
            print("No logs to process.")
            return

        # 1. Calls per day (Total calls / Total days covered)
        # We assume logs cover roughly 30 days based on generation
        total_calls = len(self.logs)
        dates = set(log.timestamp.date() for log in self.logs)
        num_days = len(dates) if dates else 1
        avg_calls_per_day = round(total_calls / num_days, 1)

        # 2. Average call duration (only for accepted calls)
        valid_calls = [log for log in self.logs if log.call_type != CallType.MISSED]
        total_duration = sum(log.duration_sec for log in valid_calls)
        avg_duration_sec = int(total_duration / len(valid_calls)) if valid_calls else 0

        # 3. Most contacted person (Frequency)
        contact_counts = {}
        for log in self.logs:
            contact_counts[log.name] = contact_counts.get(log.name, 0) + 1
        
        # Sort by count desc
        most_contacted = sorted(contact_counts.items(), key=lambda x: x[1], reverse=True)
        top_contact_name = most_contacted[0][0] if most_contacted else "N/A"
        top_contact_count = most_contacted[0][1] if most_contacted else 0

        # 4. Recent activity (Last 7 days vs Previous)
        # This will be useful for baseline comparison later, but let's just get the count for now
        now = datetime.now()
        seven_days_ago = now - timedelta(days=7)
        recent_logs = [log for log in self.logs if log.timestamp >= seven_days_ago]
        recent_call_count = len(recent_logs)

        # 5. Time of Day Distribution
        morning_calls = 0 # 6 AM - 12 PM
        afternoon_calls = 0 # 12 PM - 6 PM
        evening_night_calls = 0 # 6 PM - 6 AM

        for log in self.logs:
            hour = log.timestamp.hour
            if 6 <= hour < 12:
                morning_calls += 1
            elif 12 <= hour < 18:
                afternoon_calls += 1
            else:
                evening_night_calls += 1

        self.stats = {
            "avg_calls_per_day": avg_calls_per_day,
            "avg_duration_sec": avg_duration_sec,
            "most_contacted": (top_contact_name, top_contact_count),
            "recent_7day_count": recent_call_count,
            "time_dist": {
                "Morning": morning_calls,
                "Afternoon": afternoon_calls,
                "Night": evening_night_calls
            }
        }
        
    def show_stats(self):
        print("\n--- EXTRACTED FEATURES ---")
        if not self.stats:
            print("No stats available.")
            return
            
        print(f"1. Avg Calls/Day:       {self.stats['avg_calls_per_day']}")
        print(f"2. Avg Call Duration:   {self.stats['avg_duration_sec']} sec")
        print(f"3. Most Contacted:      {self.stats['most_contacted'][0]} ({self.stats['most_contacted'][1]} calls)")
        print(f"4. Recent (Last 7d):    {self.stats['recent_7day_count']} calls")
        print(f"5. Time Distribution:   {self.stats['time_dist']}")


# ====================
# 3. BASELINE COMPARISON
# ====================

class BaselineComparator:
    def __init__(self, logs):
        self.logs = logs
        self.anomalies = []
        self.comparison_data = {}

    def compare(self):
        print("\nComparing recent activity vs baseline...")
        if not self.logs: return

        # Split data: Recent (Last 7 days) vs Baseline (Everything before)
        now = datetime.now()
        seven_days_ago = now - timedelta(days=7)
        
        recent_logs = [log for log in self.logs if log.timestamp >= seven_days_ago]
        baseline_logs = [log for log in self.logs if log.timestamp < seven_days_ago]
        
        if not baseline_logs:
            print("Not enough data for baseline.")
            return

        # Helper to get daily average
        def get_daily_avg(log_list):
            if not log_list: return 0
            dates = set(log.timestamp.date() for log in log_list)
            num_days = len(dates) if dates else 1
            return len(log_list) / num_days

        # Helper to get avg duration
        def get_avg_duration(log_list):
            valid = [l for l in log_list if l.call_type != CallType.MISSED]
            if not valid: return 0
            return sum(l.duration_sec for l in valid) / len(valid)

        # 1. Frequency Comparison
        baseline_daily_freq = get_daily_avg(baseline_logs)
        recent_daily_freq = get_daily_avg(recent_logs)
        
        # 2. Duration Comparison
        baseline_avg_dur = get_avg_duration(baseline_logs)
        recent_avg_dur = get_avg_duration(recent_logs)

        self.comparison_data = {
            "baseline_freq": round(baseline_daily_freq, 1),
            "recent_freq": round(recent_daily_freq, 1),
            "baseline_dur": int(baseline_avg_dur),
            "recent_dur": int(recent_avg_dur)
        }

        # Detect Anomalies (Simple Rules)
        # Rule 1: Significant drop in calls (e.g., < 50% of baseline)
        if recent_daily_freq < (baseline_daily_freq * 0.5):
            self.anomalies.append("Significant drop in call frequency")
        
        # Rule 2: Shorter conversations (e.g., < 60% of usual duration)
        if recent_avg_dur < (baseline_avg_dur * 0.6):
            self.anomalies.append("Calls are much shorter than usual")
            
        # Rule 3: No activity at all
        if not recent_logs:
            self.anomalies.append("No calls in the last 7 days")

    def show_comparison(self):
        print("\n--- BASELINE COMPARISON ---")
        print(f"Daily Calls: {self.comparison_data.get('baseline_freq')} (Base) vs {self.comparison_data.get('recent_freq')} (Recent)")
        print(f"Avg Duration: {self.comparison_data.get('baseline_dur')}s (Base) vs {self.comparison_data.get('recent_dur')}s (Recent)")
        
        if self.anomalies:
            print("Detected Changes:")
            for a in self.anomalies:
                print(f" [!] {a}")
        else:
            print("No significant negative changes detected.")

    def get_anomalies(self):
        return self.anomalies


# ====================
# 4 & 5. STATUS & SUGGESTIONS
# ====================

class WellBeingEstimator:
    def __init__(self, anomalies, most_contacted_info):
        self.anomalies = anomalies
        self.most_contacted_name = most_contacted_info[0]
        self.status = "Unknown"
        self.suggestion = ""
        self.reason = ""

    def estimate(self):
        # Determine Status
        if not self.anomalies:
            self.status = "Normal (Good Connectivity)"
            self.reason = "Your communication patterns are consistent with your baseline."
        elif len(self.anomalies) == 1:
            self.status = "Slightly Off"
            self.reason = f"Flagged: {self.anomalies[0]}"
        else:
            self.status = "Needs Attention"
            self.reason = "Multiple changes detected in your social patterns."

        # Generate Human Suggestion
        if self.status.startswith("Normal"):
            self.suggestion = f"You're doing great! Maybe catch up with {self.most_contacted_name}?"
        else:
            self.suggestion = f"It looks like you've been quiet. Why not call {self.most_contacted_name} today?"

    def show_dashboard(self):
        print("\n" + "="*40)
        print("   MENTAL WELL-BEING MONITOR ( PROTOTYPE )")
        print("="*40)
        print(f"STATUS:     {self.status}")
        print("-" * 40)
        print(f"ANALYSIS:   {self.reason}")
        print("-" * 40)
        print(f"SUGGESTION: {self.suggestion}")
        print("="*40 + "\n")


# ====================
# MAIN EXECUTION
# ====================

if __name__ == "__main__":
    # 1. Initialize and Read Logs
    reader = CallLogReader()
    reader.read_last_30_days_logs()
    
    # 2. Extract Features
    extractor = FeatureExtractor(reader.get_logs())
    extractor.extract_features()
    # extractor.show_stats() # Hiding intermediate debug stats for cleaner demo

    # 3. Compare with Baseline
    comparator = BaselineComparator(reader.get_logs())
    comparator.compare()
    # comparator.show_comparison() # Hiding intermediate debug output

    # 4 & 5. Estimate Status & Suggest
    estimator = WellBeingEstimator(
        comparator.get_anomalies(),
        extractor.stats['most_contacted']
    )
    estimator.estimate()
    
    # 6. Final Output
    estimator.show_dashboard()
