import pandas as pd
import json
from config import BASE_DIR

def process_and_validate():
    raw_path = BASE_DIR / "data_raw.json"
    if not raw_path.exists():
        return None
        
    with open(raw_path, 'r') as f:
        data = json.load(f)
        
    df = pd.DataFrame(data)
    if df.empty:
        return {"score": 0, "valid_days": 0, "data": []}
        
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # Check continuity
    full_idx = pd.date_range(start=df['date'].min(), end=df['date'].max())
    df = df.set_index('date').reindex(full_idx).reset_index()
    df = df.rename(columns={'index': 'date'})
    
    # Fill missing values for all columns
    cols_to_fill = ['steps', 'active_minutes', 'sleep_minutes', 'sedentary_minutes']
    for col in cols_to_fill:
        if col not in df.columns:
            df[col] = 0
        df[col] = df[col].fillna(0)
    
    # Quality Check
    # Rule: If steps < 500, consider it a "missing/not worn" day
    df['is_valid'] = df['steps'] > 500 # Threshold
    
    quality_score = (df['is_valid'].sum() / len(df)) * 100
    
    # Save Cleaned Data
    clean_path = BASE_DIR / "data_clean.csv"
    df.to_csv(clean_path, index=False)
    
    return {
        "score": round(quality_score, 1),
        "valid_days": int(df['is_valid'].sum()),
        "total_days": len(df),
        "dataset": df.to_dict(orient='records')
    }
