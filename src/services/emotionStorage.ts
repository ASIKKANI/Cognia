// Local storage service for emotion tracking data

export interface EmotionEntry {
    timestamp: number;
    emotion: string;
    confidence: number;
}

export interface EmotionStats {
    today: EmotionEntry[];
    lastWeek: EmotionEntry[];
}

class EmotionStorageService {
    private STORAGE_KEY = 'cognia_emotion_history';
    private MAX_ENTRIES = 1000;

    saveEmotion(emotion: string, confidence: number) {
        const entry: EmotionEntry = {
            timestamp: Date.now(),
            emotion,
            confidence
        };

        const history = this.getHistory();
        history.push(entry);

        // Keep only recent entries
        if (history.length > this.MAX_ENTRIES) {
            history.shift();
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    }

    getHistory(): EmotionEntry[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    getTodayEmotions(): EmotionEntry[] {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        return this.getHistory().filter(entry => entry.timestamp >= todayTimestamp);
    }

    getLastWeekEmotions(): EmotionEntry[] {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return this.getHistory().filter(entry => entry.timestamp >= weekAgo);
    }

    calculateStabilityScore(): number {
        const todayEmotions = this.getTodayEmotions();

        if (todayEmotions.length < 5) {
            return 0; // Need at least 5 data points
        }

        // Calculate emotion distribution
        const emotionCounts: Record<string, number> = {};
        todayEmotions.forEach(entry => {
            emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
        });

        // Calculate variance (lower variance = more stable = higher score)
        const total = todayEmotions.length;
        const avgCount = total / Object.keys(emotionCounts).length;

        const variance = Object.values(emotionCounts).reduce((sum, count) => {
            return sum + Math.pow(count - avgCount, 2);
        }, 0) / Object.keys(emotionCounts).length;

        // Normalize variance to 0-100 score (lower variance = higher score)
        const normalizedVariance = Math.min(variance / avgCount, 1);
        const stabilityScore = Math.round((1 - normalizedVariance) * 100);

        // Bonus for positive emotions
        const positiveEmotions = ['happy', 'neutral'];
        const positiveCount = todayEmotions.filter(e =>
            positiveEmotions.includes(e.emotion)
        ).length;
        const positiveRatio = positiveCount / total;
        const positiveBonus = Math.round(positiveRatio * 20);

        return Math.min(stabilityScore + positiveBonus, 100);
    }

    getEmotionPercentages(): Record<string, number> {
        const todayEmotions = this.getTodayEmotions();
        if (todayEmotions.length === 0) return {};

        const counts: Record<string, number> = {};
        todayEmotions.forEach(entry => {
            counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
        });

        const percentages: Record<string, number> = {};
        Object.keys(counts).forEach(emotion => {
            percentages[emotion] = Math.round((counts[emotion] / todayEmotions.length) * 100);
        });

        return percentages;
    }
}

export const emotionStorage = new EmotionStorageService();
