import os
import datetime
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from config import BASE_DIR, CLIENT_SECRET_FILE
import pandas as pd

TOKEN_FILE = BASE_DIR / "token.json"

def get_credentials():
    if not TOKEN_FILE.exists():
        return None
    
    with open(TOKEN_FILE, 'r') as f:
        data = json.load(f)
        creds = Credentials.from_authorized_user_info(data)
    
    if creds and creds.expired and creds.refresh_token:
        # Load helper to refresh
        # We need the client_secret.json content to refresh
        # But Credentials.from_authorized_user_info usually handles it if client_config is passed or if we use proper flow
        # Actually simplest is to just request refresh
        creds.refresh(Request())
        
        # Save back
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())
            
    return creds

def get_fitness_service():
    creds = get_credentials()
    if not creds:
        raise Exception("User not logged in")
    return build('fitness', 'v1', credentials=creds)

def fetch_metrics(service, start_time, end_time):
    body = {
        "aggregateBy": [
            {
                "dataTypeName": "com.google.step_count.delta",
                "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            },
            {
                "dataTypeName": "com.google.active_minutes",
                "dataSourceId": "derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes"
            },
            {
                "dataTypeName": "com.google.activity.segment",
                "dataSourceId": "derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments"
            }
        ],
        "bucketByTime": { "durationMillis": 86400000 }, # 1 day
        "startTimeMillis": int(start_time.timestamp() * 1000),
        "endTimeMillis": int(end_time.timestamp() * 1000)
    }
    
    response = service.users().dataset().aggregate(userId="me", body=body).execute()
    
    data = []
    for bucket in response.get('bucket', []):
        t0 = int(bucket['startTimeMillis'])
        date_str = datetime.datetime.fromtimestamp(t0/1000).date().isoformat()
        
        daily_steps = 0
        daily_active_min = 0
        daily_sleep_min = 0
        daily_sedentary_min = 0
        
        for ds in bucket.get('dataset', []):
            source = ds.get('dataSourceId', '')
            
            for point in ds.get('point', []):
                for val in point.get('value', []):
                    # Steps
                    if 'step_count' in source:
                        daily_steps += val.get('intVal', 0)
                    
                    # Active Minutes
                    elif 'active_minutes' in source:
                        daily_active_min += val.get('intVal', 0)
                    
                    # Activity Segments (Duration map)
                    elif 'activity_segment' in source:
                        # value[0] is intVal (Activity Type)
                        # value[1] is intVal (Duration ms) - Wait, aggregate by activity segment returns a map usually?
                        # Actually for activity segment aggregation, we typically get a list of activities with duration.
                        # But in a "bucketByTime", if we request activity.segment, the point usually contains the dominant activity OR we can't easily aggregate activity segments like this without bucketByActivityType.
                        # Correction: To get duration per activity, we should check how Google returns it.
                        # If we just ask for activity.segment in a time bucket, it might just give points.
                        try:
                            # Handling com.google.activity.segment in aggregate is tricky. 
                            # If mapVal is present it might be there. 
                            # But usually for Sleep/Sedentary, it's safer to just rely on Active Minutes for "Activity"
                            # And maybe try to fetch Sleep specifically or infer it.
                            # Let's check mapVal.
                            if 'mapVal' in val:
                                for entry in val['mapVal']:
                                    act_type = int(entry['key']['intVal']) # Activity ID
                                    duration_ms = float(entry['value']['fpVal']) # Duration
                                    
                                    # Sleep = 72
                                    # Still = 3
                                    if act_type == 72:
                                        daily_sleep_min += (duration_ms / 60000)
                                    elif act_type == 3:
                                        daily_sedentary_min += (duration_ms / 60000)
                            else:
                                # Fallback if just intVal duration for a segment
                                act_type = val.get('intVal', 0) # This might just be the TYPE
                                # We need duration. 
                                pass
                        except:
                            pass

        data.append({
            "date": date_str, 
            "steps": int(daily_steps),
            "active_minutes": int(daily_active_min),
            "sleep_minutes": int(daily_sleep_min),
            "sedentary_minutes": int(daily_sedentary_min)
        })
        
    return data

def fetch_sleep_sessions(service, start_time, end_time):
    """
    Fetches sleep data using the Sessions API (Robust for sleep).
    Activity Type 72 = Sleep.
    """
    try:
        # Convert to RFC3339 string as required by sessions list
        start_str = start_time.isoformat() + 'Z'
        end_str = end_time.isoformat() + 'Z'
        
        response = service.users().sessions().list(
            userId='me',
            startTime=start_str,
            endTime=end_str,
            activityType=[72], # Sleep only
            includeDeleted=False
        ).execute()
        
        sessions = response.get('session', [])
        
        # Aggregate sleep duration per day
        daily_sleep = {}
        for session in sessions:
             # Session time is in millis
             start_ms = int(session.get('startTimeMillis', 0))
             end_ms = int(session.get('endTimeMillis', 0))
             duration_min = (end_ms - start_ms) / 60000
             
             # Map to Date (based on end time usually, or start time?)
             # Sleep usually counts for the day you wake up (End Time)
             date_str = datetime.datetime.fromtimestamp(end_ms/1000).date().isoformat()
             
             if date_str not in daily_sleep:
                 daily_sleep[date_str] = 0
             daily_sleep[date_str] += duration_min
             
        return daily_sleep
    except Exception as e:
        print(f"Error fetching sleep sessions: {str(e)}")
        return {}

def sync_data():
    service = get_fitness_service()
    
    now = datetime.datetime.now()
    start_time = now - datetime.timedelta(days=30)
    
    # 1. Fetch Aggregated Metrics (Steps, Active Min)
    metrics_list = fetch_metrics(service, start_time, now)
    
    # 2. Fetch Sleep Sessions (Sessions API)
    sleep_map = fetch_sleep_sessions(service, start_time, now)
    
    # 3. Merge Sleep into Metrics
    final_data = []
    for entry in metrics_list:
        d = entry['date']
        # If we have Session-based sleep, overwrite/set the sleep_minutes
        if d in sleep_map:
            entry['sleep_minutes'] = int(sleep_map[d])
        else:
             # Keep existing (which is 0 from fallback) or set to 0
             # entry['sleep_minutes'] = 0
             pass
        final_data.append(entry)
    
    # Store Raw Data (JSON)
    raw_path = BASE_DIR / "data_raw.json"
    with open(raw_path, 'w') as f:
        json.dump(final_data, f)
        
    return final_data
