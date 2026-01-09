import type { WellbeingData, WellbeingIndicator, Emotion } from '../types';

export const calculateWellbeing = (
    history: WellbeingData[],
    activeSeconds: number = 0
): WellbeingIndicator => {
    if (history.length === 0) {
        return {
            status: 'Stable',
            score: 100,
            trend: 'stable',
            description: 'Waiting for data to analyze patterns.'
        };
    }

    const recentData = history.slice(-10);
    const emotionScores: Record<Emotion, number> = {
        happy: 95, surprise: 80, neutral: 70, sad: 50, fear: 40, angry: 35, disgust: 30
    };

    let totalScore = 0;
    recentData.forEach(data => {
        totalScore += emotionScores[data.dominantEmotion] || 50;
    });

    let averageScore = totalScore / recentData.length;

    let extraDescription = '';
    if (activeSeconds > 7200) { // More than 2 hours
        averageScore -= 10;
        extraDescription = ' Prolonged screen time detected. Consider a 15-minute eye rest.';
    }

    averageScore = Math.min(100, Math.max(0, averageScore));

    let status: WellbeingIndicator['status'] = 'Stable';
    let description = 'Your emotional baseline is holding steady.' + extraDescription;

    if (averageScore < 50) {
        status = 'Needs Attention';
        description = 'We\'ve noticed a persistent decline in your mood markers.' + extraDescription + ' A break is highly recommended.';
    } else if (averageScore < 60) {
        status = 'Fluctuating';
        description = 'Your emotional markers are showing some volatility today.' + extraDescription;
    }

    // Trend analysis (longer window)
    const earlierData = history.slice(-20, -10);
    let trend: WellbeingIndicator['trend'] = 'stable';

    if (earlierData.length > 0) {
        const earlierScore = earlierData.reduce((acc, d) => acc + (emotionScores[d.dominantEmotion] || 50), 0) / earlierData.length;
        if (averageScore > earlierScore + 3) trend = 'improving';
        else if (averageScore < earlierScore - 3) trend = 'declining';
    }

    return {
        status,
        score: Math.round(averageScore),
        trend,
        description
    };
};

export const getStatusColor = (status: WellbeingIndicator['status']) => {
    switch (status) {
        case 'Stable': return 'text-accent';
        case 'Fluctuating': return 'text-risk-medium';
        case 'Needs Attention': return 'text-risk-high';
        default: return 'text-slate-400';
    }
};
