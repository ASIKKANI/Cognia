import { type AnalyticsData, type CategoryScore } from './analyticsService';

export interface Suggestion {
    type: 'strength' | 'concern' | 'action';
    category: string;
    icon: string;
    title: string;
    message: string;
}

class SuggestionsEngine {
    generateSuggestions(data: AnalyticsData): Suggestion[] {
        const suggestions: Suggestion[] = [];
        const { categories, overallScore } = data;

        // Overall wellness check
        if (overallScore >= 80) {
            suggestions.push({
                type: 'strength',
                category: 'overall',
                icon: '🌟',
                title: 'Excellent Overall Wellness!',
                message: 'You\'re doing amazing! Keep up the great balance across all areas of your life.'
            });
        } else if (overallScore < 50) {
            suggestions.push({
                type: 'concern',
                category: 'overall',
                icon: '⚠️',
                title: 'Wellness Needs Attention',
                message: 'Multiple areas need improvement. Focus on small wins in each category.'
            });
        }

        // Emotional Stability
        this.analyzeEmotionalStability(categories.emotionalStability, suggestions);

        // Productivity
        this.analyzeProductivity(categories.productivity, suggestions);

        // Physical Wellness
        this.analyzePhysical(categories.physicalWellness, suggestions);

        // Time Management
        this.analyzeTime(categories.timeManagement, suggestions);

        // Emotional Resonance (Spotify)
        this.analyzeResonance(categories.emotionalResonance, suggestions);

        // Mental Wellness (Journal)
        this.analyzeMental(categories.mentalWellness, suggestions);

        return suggestions;
    }

    private analyzeEmotionalStability(cat: CategoryScore, suggestions: Suggestion[]) {
        if (cat.score >= 75) {
            suggestions.push({
                type: 'strength',
                category: 'emotional',
                icon: '😊',
                title: 'Great Emotional Balance',
                message: 'Your emotions are stable today. Keep practicing mindfulness!'
            });
        } else if (cat.score < 50) {
            suggestions.push({
                type: 'action',
                category: 'emotional',
                icon: '🧘',
                title: 'Try Meditation',
                message: 'Your mood varies a lot. Try 10 minutes of meditation or deep breathing exercises.'
            });
        }
    }

    private analyzeProductivity(cat: CategoryScore, suggestions: Suggestion[]) {
        if (cat.score >= 70) {
            suggestions.push({
                type: 'strength',
                category: 'productivity',
                icon: '🚀',
                title: 'Productive Day!',
                message: 'Great app balance and focus time. You\'re crushing it!'
            });
        } else if (cat.score < 50) {
            suggestions.push({
                type: 'action',
                category: 'productivity',
                icon: '⏰',
                title: 'Use Pomodoro Technique',
                message: 'Low productivity score. Try 25-minute focused work sessions with 5-minute breaks.'
            });
        }
    }

    private analyzePhysical(cat: CategoryScore, suggestions: Suggestion[]) {
        if (cat.score >= 75) {
            suggestions.push({
                type: 'strength',
                category: 'physical',
                icon: '💪',
                title: 'Excellent Physical Health!',
                message: 'Good sleep and activity levels. Your body is well taken care of!'
            });
        } else if (cat.score < 60) {
            suggestions.push({
                type: 'action',
                category: 'physical',
                icon: '🏃',
                title: 'Get Moving',
                message: 'Low physical wellness. Go for a 20-minute walk or hit the gym today!'
            });
            suggestions.push({
                type: 'action',
                category: 'physical',
                icon: '😴',
                title: 'Improve Sleep',
                message: 'Aim for 7-9 hours of sleep. Set a consistent bedtime routine.'
            });
        }
    }

    private analyzeTime(cat: CategoryScore, suggestions: Suggestion[]) {
        if (cat.score >= 70) {
            suggestions.push({
                type: 'strength',
                category: 'time',
                icon: '📅',
                title: 'Well-Managed Schedule',
                message: 'Your calendar looks balanced with good breaks between tasks.'
            });
        } else if (cat.score < 50) {
            suggestions.push({
                type: 'action',
                category: 'time',
                icon: '📋',
                title: 'Review Your Schedule',
                message: 'Too many meetings or gaps. Use time-blocking to structure your day better.'
            });
        }
    }

    private analyzeResonance(cat: CategoryScore, suggestions: Suggestion[]) {
        const details = cat.details.toLowerCase();

        if (details.includes('melancholic') || details.includes('sad')) {
            suggestions.push({
                type: 'action',
                category: 'music',
                icon: '🎵',
                title: 'Try Uplifting Music',
                message: 'You\'ve been listening to sad songs. Try upbeat playlists to boost your mood!'
            });
        } else if (cat.score >= 75) {
            suggestions.push({
                type: 'strength',
                category: 'music',
                icon: '🎶',
                title: 'Great Music Choices',
                message: 'Your music taste reflects emotional balance. Keep vibing!'
            });
        }
    }

    private analyzeMental(cat: CategoryScore, suggestions: Suggestion[]) {
        if (cat.score >= 75) {
            suggestions.push({
                type: 'strength',
                category: 'mental',
                icon: '📝',
                title: 'Consistent Journaling',
                message: 'Regular journaling with positive reflections. Excellent mental health practice!'
            });
        } else if (cat.score < 60) {
            suggestions.push({
                type: 'action',
                category: 'mental',
                icon: '✍️',
                title: 'Write in Your Journal',
                message: 'Low mental wellness score. Write about 3 things you\'re grateful for today.'
            });
        }
    }
}

export const suggestionsEngine = new SuggestionsEngine();
