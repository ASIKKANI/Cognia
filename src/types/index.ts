export type Emotion = 'angry' | 'disgust' | 'fear' | 'happy' | 'neutral' | 'sad' | 'surprise';

export interface EmotionResult {
    label: Emotion;
    score: number;
}

export interface WellbeingData {
    timestamp: number;
    emotions: EmotionResult[];
    dominantEmotion: Emotion;
    confidence: number;
}

export interface WellbeingIndicator {
    status: 'Stable' | 'At Risk' | 'Fluctuating' | 'Needs Attention';
    score: number; // 0-100
    trend: 'improving' | 'declining' | 'stable';
    description: string;
}

export type MonitoringSchedule = 'morning' | 'afternoon' | 'evening' | 'always';
