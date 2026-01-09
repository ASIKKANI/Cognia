import pandas as pd
import numpy as np
from config import BASE_DIR

def calculate_insights():
    clean_path = BASE_DIR / "data_clean.csv"
    if not clean_path.exists():
        return None
        
    df = pd.read_csv(clean_path)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # Needs at least 14 days for a good baseline
    if len(df) < 7:
         return {
            "status": "Insuffient Data",
            "trend": "Unknown",
            "confidence": "Low",
            "details": "Need more data points to establish baseline."
        }
        
    # Baseline: Previous 30 days excluding last 3 days (to detect recent deviation)
    recent_window = 3
    if len(df) > recent_window:
        history = df.iloc[:-recent_window] # Baseline data
        recent = df.iloc[-recent_window:] # Recent data
    else:
        history = df
        recent = df.iloc[-1:]

    # Metrics: Steps, Active Minutes, Sleep
    baseline_steps = history['steps'].median()
    baseline_active = history['active_minutes'].median()
    baseline_sleep = history['sleep_minutes'].median()
    baseline_steps_std = history['steps'].std()
    
    recent_steps = recent['steps'].median()
    recent_active = recent['active_minutes'].median()
    recent_sleep = recent['sleep_minutes'].median()
    
    # Deviation Calculation (Weighted?)
    # Primary driver is steps for "Energy"
    deviation_steps = recent_steps - baseline_steps
    
    if baseline_steps_std == 0:
        z_score = 0
    else:
        z_score = deviation_steps / (baseline_steps_std + 1) # +1 to avoid div by zero
    
    status = "Stable"
    trend = "Flat"
    confidence = "Medium"
    
    # Logic:
    # 1. Energy Drop: Steps & Active Minutes down
    # 2. Sleep Issues: Sleep duration Variance high OR Sleep duration drop
    
    if z_score < -1.0:
        status = "Needs Attention" 
        trend = "Declining"
    elif z_score > 1.0:
        status = "Energetic"
        trend = "Improving"
        
    # Check Sleep Impact
    sleep_diff = recent_sleep - baseline_sleep
    if abs(sleep_diff) > 60: # 1 hour change
         if sleep_diff < 0:
             trend = f"{trend} (Sleep Loss)"
         else:
             trend = f"{trend} (Sleep +)"

    # Load Calendar Context
    import json
    context_path = BASE_DIR / "data_calendar.json"
    calendar_data = {}
    if context_path.exists():
        with open(context_path, 'r') as f:
            calendar_data = json.load(f)
            
    # Consistency Check (Variability)
    recent_std = recent['steps'].std()
    if recent_std > (baseline_steps_std * 2):
        confidence = "Low"
        
    # Contextual Explanation
    explanation = "Routine is consistent."
    
    # Check if recent days had high calendar load
    recent_dates = recent['date'].dt.strftime('%Y-%m-%d').tolist()
    high_load_days = 0
    travel_days = 0
    
    for d in recent_dates:
        if d in calendar_data:
            day_ctx = calendar_data[d]
            if day_ctx.get('schedule_density') == 'High':
                high_load_days += 1
            if day_ctx.get('is_travel_day'):
                travel_days += 1
                
    if status == "Needs Attention" or trend == "Declining":
        if travel_days > 0:
            explanation = "Deviation likely caused by recent travel."
            confidence = "High" # Context explains the drop
        elif high_load_days > 0:
            explanation = "Schedule density (high workload) correlates with reduced activity."
            confidence = "High"
        else:
            explanation = "Unexplained drop in activity. Monitor sleep patterns."
    elif status == "Energetic":
        explanation = "Positive trend in activity levels."
        
    # Prepare Calendar Highlights for Frontend
    upcoming_events = []
    # Get last 7 days + Look forward logic (if we had future data, but here using recent history)
    # Actually, let's just send the recent relevant calendar days
    for date_key, ctx in calendar_data.items():
        # Only include if it has tags or high density
        if ctx.get('tags') or ctx.get('schedule_density') == 'High':
            upcoming_events.append({
                "date": date_key,
                "tags": ctx.get('tags', []),
                "density": ctx.get('schedule_density'),
                "events": ctx.get('events', [])
            })
            
    # Sort by date
    upcoming_events.sort(key=lambda x: x['date'], reverse=True)

    return {
        "status": status,
        "trend": trend,
        "confidence": confidence,
        "explanation": explanation,
        "metrics": {
            "baseline_steps": int(baseline_steps),
            "recent_steps": int(recent_steps),
            "baseline_active": int(baseline_active),
            "recent_active": int(recent_active),
            "baseline_sleep": int(baseline_sleep),
            "recent_sleep": int(recent_sleep),
            "z_score": round(z_score, 2)
        },
        "history": df[['date', 'steps', 'active_minutes', 'sleep_minutes']].tail(30).to_dict(orient='records'),
        "calendar_context": upcoming_events[:10] # Top 10 recent relevant days
    }
