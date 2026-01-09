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

    # Consistency Check (Variability)
    recent_std = recent['steps'].std()
    if recent_std > (baseline_steps_std * 2):
        confidence = "Low"
        
    return {
        "status": status,
        "trend": trend,
        "confidence": confidence,
        "metrics": {
            "baseline_steps": int(baseline_steps),
            "recent_steps": int(recent_steps),
            "baseline_active": int(baseline_active),
            "recent_active": int(recent_active),
            "baseline_sleep": int(baseline_sleep),
            "recent_sleep": int(recent_sleep),
            "z_score": round(z_score, 2)
        },
        "history": df[['date', 'steps', 'active_minutes', 'sleep_minutes']].tail(30).to_dict(orient='records')
    }
