import axios from 'axios';
import { emotionStorage } from './emotionStorage';

export interface CategoryScore {
    name: string;
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    details: string;
}

export interface AnalyticsData {
    date: string;
    overallScore: number;
    categories: {
        emotionalStability: CategoryScore;
        productivity: CategoryScore;
        physicalWellness: CategoryScore;
        timeManagement: CategoryScore;
        emotionalResonance: CategoryScore;
        mentalWellness: CategoryScore;
    };
    rawData: {
        emotions?: any;
        digitalActivity?: any;
        fitness?: any;
        calendar?: any;
        spotify?: any;
        journal?: any;
    };
}

class AnalyticsService {
    async fetchAllData(): Promise<AnalyticsData> {
        const today = new Date().toISOString().split('T')[0];

        // Fetch from all sources in parallel
        const [digitalActivity, fitness] = await Promise.all([
            this.fetchDigitalActivity().catch(() => null),
            this.fetchFitness().catch(() => null),
        ]);

        // Calculate scores from REAL data
        const productivityScore = this.calculateProductivityScore(digitalActivity);
        const physicalScore = this.calculatePhysicalScore(fitness);
        const emotionalScore = this.calculateEmotionalScore(); // Now uses real emotion data

        // Calculate overall score from available real data (equal weighting)
        const scores = [productivityScore.score, physicalScore.score];
        if (emotionalScore.score > 0) scores.push(emotionalScore.score);

        const overallScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        return {
            date: today,
            overallScore,
            categories: {
                emotionalStability: emotionalScore,
                productivity: productivityScore,
                physicalWellness: physicalScore,
                timeManagement: this.calculateTimeScore(),
                emotionalResonance: this.calculateResonanceScore(),
                mentalWellness: this.calculateMentalScore(),
            },
            rawData: {
                digitalActivity,
                fitness,
            }
        };
    }

    private async fetchDigitalActivity() {
        const response = await axios.get('http://localhost:8080/stats');
        return response.data;
    }

    private async fetchFitness() {
        const response = await axios.get('http://localhost:8000/insights');
        return response.data;
    }

    private calculateProductivityScore(data: any): CategoryScore {
        if (!data || !data.apps) {
            return { name: 'Productivity Balance', score: 0, status: 'poor', details: 'No data available' };
        }

        const totalSeconds = data.total_seconds || 1;
        const appUsage = data.apps || {};

        // Calculate diversity (number of different apps used)
        const appCount = Object.keys(appUsage).length;
        const diversityScore = Math.min(appCount * 10, 50); // Max 50 points for diversity

        // Calculate balance (not spending too much time on one app)
        const appTimes = Object.values(appUsage) as number[];
        const maxTime = Math.max(...appTimes, 1);
        const balanceScore = Math.min((1 - (maxTime / totalSeconds)) * 100, 50); // Max 50 points for balance

        const score = Math.round(diversityScore + balanceScore);
        const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

        return {
            name: 'Productivity Balance',
            score,
            status,
            details: `${appCount} apps used with balanced time distribution`
        };
    }

    private calculatePhysicalScore(data: any): CategoryScore {
        if (!data || !data.metrics) {
            return { name: 'Physical Wellness', score: 0, status: 'poor', details: 'No data available' };
        }

        const { recent_sleep = 0, recent_active = 0 } = data.metrics;

        // Sleep score (optimal: 420-540 min = 7-9 hours)
        const sleepScore = recent_sleep >= 420 && recent_sleep <= 540 ? 50 :
            recent_sleep >= 360 && recent_sleep < 420 ? 35 :
                recent_sleep > 540 && recent_sleep <= 600 ? 35 : 20;

        // Activity score (optimal: >60 min active)
        const activityScore = recent_active >= 60 ? 50 :
            recent_active >= 30 ? 35 :
                recent_active >= 15 ? 20 : 10;

        const score = sleepScore + activityScore;
        const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

        return {
            name: 'Physical Wellness',
            score,
            status,
            details: `${Math.round(recent_sleep / 60)}h sleep, ${recent_active}min active`
        };
    }

    private calculateEmotionalScore(): CategoryScore {
        const score = emotionStorage.calculateStabilityScore();
        const percentages = emotionStorage.getEmotionPercentages();

        if (score === 0) {
            return {
                name: 'Emotional Stability',
                score: 0,
                status: 'poor',
                details: 'No data - start monitoring emotions'
            };
        }

        const status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';
        const topEmotions = Object.entries(percentages)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([emotion, pct]) => `${emotion} ${pct}%`)
            .join(', ');

        return {
            name: 'Emotional Stability',
            score,
            status,
            details: topEmotions || 'Tracking emotions...'
        };
    }

    private calculateTimeScore(): CategoryScore {
        // Mock: Simulate calendar-based time management
        const score = 72;
        return {
            name: 'Time Management',
            score,
            status: 'good',
            details: '6 meetings today, balanced schedule'
        };
    }

    private calculateResonanceScore(): CategoryScore {
        // Mock: Simulate Spotify mood analysis
        const score = 65;
        return {
            name: 'Emotional Resonance',
            score,
            status: 'good',
            details: 'Mostly upbeat genres, 35% melancholic'
        };
    }

    private calculateMentalScore(): CategoryScore {
        // Mock: Simulate journal sentiment
        const score = 78;
        return {
            name: 'Mental Wellness',
            score,
            status: 'good',
            details: '3 entries this week, positive sentiment'
        };
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'excellent': return '#10b981';
            case 'good': return '#3b82f6';
            case 'fair': return '#f59e0b';
            case 'poor': return '#ef4444';
            default: return '#64748b';
        }
    }
}

export const analyticsService = new AnalyticsService();
