/**
 * Intelligent Insight Engine
 * Analyzes multi-dimensional user data (BMI, sleep, steps, time) to provide 
 * context-aware health insights and corrective action recommendations.
 */
export const insightEngine = {
    /**
     * Calculates a cumulative risk score for a sugar intake event.
     * @param {Object} userData - User profile including BMI.
     * @param {string} logTime - Timestamp of the log.
     * @param {Object} dailyData - Current day's steps and sleep data.
     * @returns {number} Normalized risk score.
     */
    calculateRiskScore: (userData, logTime, dailyData = { steps: 8000, sleep: 8 }) => {
        let riskScore = 0;

        // BMI Logic
        if (userData.bmi > 25) riskScore += 2;

        // Time Logic (Late sugar after 8PM)
        const hour = new Date(logTime).getHours();
        if (hour >= 20 || hour < 5) riskScore += 3;

        // Steps Logic (Low activity)
        if (dailyData.steps < 4000) riskScore += 2;

        // Sleep Logic (Low sleep)
        if (dailyData.sleep < 6) riskScore += 2;

        return riskScore;
    },

    /**
     * Generates a personalized insight and corrective action based on data clusters.
     * Prioritizes low sleep and activity levels over generic risk scores.
     * @param {number} riskScore - Calculated risk for the event.
     * @param {Object} userData - User profile metadata.
     * @param {Object} dailyData - Current day's activity metrics.
     * @returns {Object} Recommendation containing insight text and action text.
     */
    getRecommendation: (riskScore, userData, dailyData = { steps: 8000, sleep: 8 }) => {
        // Priority 1: Low Sleep
        if (dailyData.sleep < 6) {
            return {
                insight: "Low sleep may increase sugar cravings and reduce insulin sensitivity.",
                action: "Prioritize 8 hours of sleep tonight.",
                reason: "Insufficient sleep (< 6 hours) impairs glucose metabolism"
            };
        }

        // Priority 2: Low Activity
        if (dailyData.steps < 4000) {
            return {
                insight: "Late sugar on low-activity days may reduce sleep quality.",
                action: "Take a 10-minute walk now.",
                reason: "Low daily activity (< 4000 steps) reduces sugar processing efficiency"
            };
        }

        // Priority 3: BMI/Risk Score logic
        if (riskScore >= 5) {
            if (userData.bmi > 25) {
                return {
                    insight: "Current BMI and activity levels suggest higher sugar impact.",
                    action: "Swap next snack with a protein-rich option.",
                    reason: `Your BMI (${parseFloat(userData.bmi).toFixed(1)}) indicates higher metabolic sensitivity`
                };
            }
            return {
                insight: "High-risk intake detected given current conditions.",
                action: "Take a 15-minute quick walk now.",
                reason: "Combined risk factors (time + activity) suggest immediate movement"
            };
        }

        // Default: Healthy balance
        return {
            insight: "Good activity levels! Keep maintaining the balance.",
            action: "Drink a glass of water now.",
            reason: "Hydration helps with metabolic regulation & cravings"
        };
    },

    /**
     * Generates motivational quotes for the dashboard
     * Varies by time of day and user progress
     */
    getMotivationalQuote: (hour, streakCount, level) => {
        const morningQuotes = [
            "🌅 Fresh start! Protect your streak today.",
            "☀️ Every log is a victory for your health.",
            "💪 You've got this! Today's a new opportunity."
        ];
        
        const afternoonQuotes = [
            "🌤️ Halfway through! Keep the momentum going.",
            "⚡ Your streak is on fire! 🔥 Keep it up.",
            "🎯 Smart choices = strong shield. You're doing great!"
        ];
        
        const eveningQuotes = [
            "🌙 Tonight's decisions shape tomorrow's health.",
            "✨ One more log to close out a great day!",
            "🛡️ Your shield is getting stronger. Log before bed!"
        ];

        let quotes = morningQuotes;
        if (hour >= 12 && hour < 18) quotes = afternoonQuotes;
        if (hour >= 18) quotes = eveningQuotes;

        // Add milestone messages
        if (streakCount === 7) return "🎉 First milestone! 7-day streak unlocked!";
        if (streakCount === 30) return "🏆 Legend status! 30-day streakmaster!";
        if (streakCount === 100) return "👑 You're unstoppable! 100-day master achieved!";
        if (level >= 5) return `🚀 Level ${level} reached! You're a SugarShield champion!`;

        return quotes[Math.floor(Math.random() * quotes.length)];
    },

    /**
     * Checks if user hit a streak milestone
     */
    checkStreakMilestone: (streakCount) => {
        if (streakCount === 7) return { milestone: true, message: "🎉 7-Day Streak!", bonus: 50 };
        if (streakCount === 30) return { milestone: true, message: "🏆 30-Day Legend!", bonus: 100 };
        if (streakCount === 100) return { milestone: true, message: "👑 100-Day Master!", bonus: 200 };
        return { milestone: false };
    }
};
