import { DailySpotifyFeatures } from "./spotify";

export interface StabilityResult {
    score: number;
    confidence: number;
    explanation: string;
    isDeviationSustained: boolean;
}

export function calculatePersonalBaseline(historicalData: DailySpotifyFeatures[]) {
    if (historicalData.length === 0) return null;

    const sum = historicalData.reduce((acc, curr) => acc + curr.totalDurationMinutes, 0);
    const mean = sum / historicalData.length;

    const variance = historicalData.reduce((acc, curr) => {
        return acc + Math.pow(curr.totalDurationMinutes - mean, 2);
    }, 0) / historicalData.length;

    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
}

export function analyzeStability(
    current: DailySpotifyFeatures,
    baseline: { mean: number; stdDev: number } | null,
    recentTrend: DailySpotifyFeatures[]
): StabilityResult {
    if (!baseline) {
        return {
            score: 100,
            confidence: 0,
            explanation: "Establishing your personal baseline. Keep listening to see insights.",
            isDeviationSustained: false,
        };
    }

    const deviation = Math.abs(current.totalDurationMinutes - baseline.mean);
    const zScore = baseline.stdDev === 0 ? 0 : deviation / baseline.stdDev;

    // Normalize score: 100 is stable, lower is more deviation
    const score = Math.max(0, Math.min(100, 100 - (zScore * 20)));

    // Check for sustained deviation (last 3 days)
    const isDeviationSustained = recentTrend.length >= 3 && recentTrend.every(d => {
        const dDev = Math.abs(d.totalDurationMinutes - baseline.mean);
        const dZ = baseline.stdDev === 0 ? 0 : dDev / baseline.stdDev;
        return dZ > 1.5;
    });

    let explanation = "Your listening rhythm is consistent with your personal baseline.";
    if (zScore > 2) {
        explanation = "Your activity level has deviated significantly from your typical pattern today.";
    } else if (isDeviationSustained) {
        explanation = "We've noticed a sustained shift in your listening rhythm over the past few days.";
    }

    return {
        score: Math.round(score),
        confidence: Math.round(Math.min(recentTrend.length / 21, 1) * 100),
        explanation,
        isDeviationSustained,
    };
}
