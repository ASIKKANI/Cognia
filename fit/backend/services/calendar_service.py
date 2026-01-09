import datetime
from googleapiclient.discovery import build
from services.auth import get_credentials
from config import BASE_DIR
import json

def get_calendar_service():
    creds = get_credentials()
    if not creds:
        raise Exception("User not logged in")
    return build('calendar', 'v3', credentials=creds)

def fetch_recent_events(days=30):
    service = get_calendar_service()
    
    now = datetime.datetime.utcnow()
    end_time = now.isoformat() + 'Z' # 'Z' indicates UTC time
    
    # Start time is X days ago
    start_time = (now - datetime.timedelta(days=days)).isoformat() + 'Z'
    
    print(f"Fetching calendar from {start_time} to {end_time}")
    
    events_result = service.events().list(
        calendarId='primary', 
        timeMin=start_time,
        timeMax=end_time,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    events = events_result.get('items', [])
    return events

def analyze_calendar_context(events):
    """
    Analyzes list of events to produce daily metrics:
    - meetings_count
    - total_duration_minutes
    - density_score (0-10)
    """
    daily_stats = {}
    
    for event in events:
         start = event['start'].get('dateTime', event['start'].get('date'))
         end = event['end'].get('dateTime', event['end'].get('date'))
         summary = event.get('summary', 'Busy')
         
         # Convert to datetime object
         is_all_day = False
         if 'T' in start:
             start_dt = datetime.datetime.fromisoformat(start)
             end_dt = datetime.datetime.fromisoformat(end)
         else:
             is_all_day = True
             start_dt = datetime.datetime.strptime(start, '%Y-%m-%d')
             end_dt = datetime.datetime.strptime(end, '%Y-%m-%d')
             
         date_key = start_dt.date().isoformat()
         
         if date_key not in daily_stats:
             daily_stats[date_key] = {
                 "meetings_count": 0,
                 "total_duration_minutes": 0,
                 "events": [],
                 "tags": set()
             }
             
         daily_stats[date_key]['events'].append(summary)
         
         # Tagging Logic
         lower_summary = summary.lower()
         if is_all_day:
             if 'holiday' in lower_summary:
                 daily_stats[date_key]['tags'].add('Holiday')
             if 'birthday' in lower_summary:
                 daily_stats[date_key]['tags'].add('Personal')
         
         if 'travel' in lower_summary or 'flight' in lower_summary or 'trip' in lower_summary:
             daily_stats[date_key]['tags'].add('Travel')
         if 'deadline' in lower_summary or 'exam' in lower_summary or 'submission' in lower_summary:
             daily_stats[date_key]['tags'].add('High Stakes')

         # Metrics
         if not is_all_day:
             duration_min = (end_dt - start_dt).total_seconds() / 60
             daily_stats[date_key]['meetings_count'] += 1
             daily_stats[date_key]['total_duration_minutes'] += duration_min
             
    # Calculate Context Tags & Finalize
    results = {}
    for date, stats in daily_stats.items():
        density = "Low"
        if stats['total_duration_minutes'] > 300: # 5 hours
            density = "High"
        elif stats['total_duration_minutes'] > 120:
             density = "Medium"
             
        stats['schedule_density'] = density
        stats['tags'] = list(stats['tags']) # Convert set to list for JSON
        results[date] = stats
        
    return results

def sync_calendar_context():
    events = fetch_recent_events(days=30)
    context_map = analyze_calendar_context(events)
    
    # Save context map
    context_path = BASE_DIR / "data_calendar.json"
    with open(context_path, 'w') as f:
        json.dump(context_map, f)
        
    return context_map
