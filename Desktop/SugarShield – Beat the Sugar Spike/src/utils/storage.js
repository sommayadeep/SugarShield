const STORAGE_KEYS = {
    USER_DATA: 'sugarshield_user_data',
    LOGS: 'sugarshield_logs',
    STREAK: 'sugarshield_streak',
    IS_SUBSCRIBED: 'sugarshield_is_subscribed',
    XP: 'sugarshield_xp',
    DAILY_DATA: 'sugarshield_daily_data',
};

/**
 * Utility for persisting and retrieving application state from LocalStorage.
 * Handles user profiles, activity logs, gamification stats, and subscription status.
 */
export const storage = {
    /**
     * Retrieves daily activity data (steps/sleep) for the current date.
     * @returns {Object} Data object with default fallback values.
     */
    getDailyData: () => {
        const today = new Date().toISOString().split('T')[0];
        const data = localStorage.getItem(`${STORAGE_KEYS.DAILY_DATA}_${today}`);
        return data ? JSON.parse(data) : { steps: 0, sleep: 7 };
    },
    /**
     * Persists daily activity data for the current date.
     * @param {Object} newData - Partial or complete data object to merge.
     */
    saveDailyData: (newData) => {
        const today = new Date().toISOString().split('T')[0];
        const currentData = storage.getDailyData();
        const updated = { ...currentData, ...newData };
        localStorage.setItem(`${STORAGE_KEYS.DAILY_DATA}_${today}`, JSON.stringify(updated));
        return updated;
    },
    getXP: () => {
        const xp = localStorage.getItem(STORAGE_KEYS.XP);
        return xp ? parseInt(xp, 10) : 0;
    },
    saveXP: (xp) => {
        localStorage.setItem(STORAGE_KEYS.XP, xp.toString());
    },
    getUserData: () => {
        const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    },
    saveUserData: (data) => {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    },
    /**
     * Retrieves all sugar log entries from local storage.
     * @returns {Array} List of logs.
     */
    getLogs: () => {
        const data = localStorage.getItem(STORAGE_KEYS.LOGS);
        return data ? JSON.parse(data) : [];
    },
    /**
     * Appends a new sugar log entry with a unique ID and timestamp.
     * @param {Object} log - The log entry data (e.g., type, xp).
     * @returns {Array} Updated list of logs.
     */
    saveLog: (log) => {
        const logs = storage.getLogs();
        logs.push({ ...log, id: Date.now(), timestamp: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
        return logs;
    },
    getStreak: () => {
        const data = localStorage.getItem(STORAGE_KEYS.STREAK);
        return data ? JSON.parse(data) : { count: 0, lastDate: null };
    },
    saveStreak: (streak) => {
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    },
    getIsSubscribed: () => {
        return localStorage.getItem(STORAGE_KEYS.IS_SUBSCRIBED) === 'true';
    },
    saveIsSubscribed: (val) => {
        localStorage.setItem(STORAGE_KEYS.IS_SUBSCRIBED, val);
    },
};

/**
 * Static utility to calculate Body Mass Index.
 * @param {number} weight - Weight in kilograms.
 * @param {number} height - Height in centimeters.
 * @returns {string} Calculated BMI formatted to 1 decimal place.
 */
export const calculateBMI = (weight, height) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};
