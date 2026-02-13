import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Plus, MapPin, Coffee, Beer, Candy, Cookie, Footprints, User, Pencil, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storage, calculateBMI } from '../utils/storage';
import { insightEngine } from '../utils/insightEngine';

/**
 * Configurable options for sugar logging.
 * Each option includes a unique ID, display label, icon, and tailwind color classes.
 */
const SUGAR_OPTIONS = [
    { id: 'chai', label: 'Chai', icon: Coffee, color: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/50' },
    { id: 'cold_drink', label: 'Cold Drink', icon: Beer, color: 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-blue-500/50' },
    { id: 'sweets', label: 'Sweets', icon: Candy, color: 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-pink-500/50' },
    { id: 'snack', label: 'Packaged Snack', icon: Cookie, color: 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/50' },
];

const GENDER_OPTIONS = ['👨 Male', '👩 Female', '🌈 Other'];

/**
 * Main Dashboard Component
 * Manages the core user experience including sugar logging, gamification, 
 * daily activity tracking, and intelligent health insights.
 */
const Dashboard = React.memo(function Dashboard({ user }) {
const [activeTab, setActiveTab] = useState('home'); // 'home', 'history', 'rewards', 'profile'
    const [streak, setStreak] = useState(storage.getStreak());
    const [xp, setXP] = useState(storage.getXP());
    const [showReward, setShowReward] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showMilestone, setShowMilestone] = useState(false);
    const [milestoneData, setMilestoneData] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(storage.getIsSubscribed());
    const [lastAction, setLastAction] = useState(null);
    const [logs, setLogs] = useState(storage.getLogs());
    const [dailyData, setDailyData] = useState(storage.getDailyData());
    const [streakNotification, setStreakNotification] = useState(null);
    const [audioSupported, setAudioSupported] = useState(true);
const [profileForm, setProfileForm] = useState({
        age: user?.age || '',
        height: user?.height || '',
        weight: user?.weight || '',
        gender: user?.gender || '',
    });
    const [showProfileEdit, setShowProfileEdit] = useState(false);

    // Sync profile form with user data
    useEffect(() => {
        setProfileForm({
            age: user?.age || '',
            height: user?.height || '',
            weight: user?.weight || '',
            gender: user?.gender || '',
        });
    }, [user]);

    // Ensure user exists, fallback to default values
    const safeUser = user || { bmi: 23, age: 25, height: 170, weight: 70, gender: 'Other' };

    const level = Math.floor(xp / 100) + 1;
    const progress = xp % 100;
    const hour = new Date().getHours();
    const motivationalQuote = React.useMemo(() =>
        insightEngine.getMotivationalQuote(hour, streak.count, level),
        [hour, streak.count, level]);
    const streakMilestone = insightEngine.checkStreakMilestone(streak.count);

    // Check if today was logged
    const today = new Date().toISOString().split('T')[0];
    const todayLogged = logs.some(log => log.timestamp.startsWith(today));

    /**
     * Handles account creation process.
     * Persists subscription state and triggers success celebration.
     */
    const handleSignup = () => {
        try {
            storage.saveIsSubscribed(true);
            setIsSubscribed(true);
            setShowSignup(false);

            // Celebration
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.3 },
                colors: ['#3B82F6', '#22C55E', '#F97316']
            });

            // Feedback: Show a temporary success state in the header or a simple alert
            alert("Account Created! You've unlocked deeper insights. 🛡️");
        } catch (error) {
            console.error('Signup failed:', error);
            // Fallback: still try to close modal
            setShowSignup(false);
        }
    };

/**
     * Updates daily health metrics (steps/sleep) and persists to local storage.
     */
    const handleDailyDataUpdate = (field, value) => {
        const newData = { [field]: parseInt(value, 10) || 0 };
        const updated = storage.saveDailyData(newData);
        setDailyData(updated);
    };

    /**
     * Handles profile update (age, height, weight, gender).
     */
    const handleProfileUpdate = () => {
        const { age, height, weight, gender } = profileForm;
        if (!age || !height || !weight || !gender) {
            alert('Please fill in all fields!');
            return;
        }
        const bmi = calculateBMI(weight, height);
        const updatedUser = { ...user, ...profileForm, bmi };
        storage.saveUserData(updatedUser);
        // Update the user prop through parent
        if (user && user.onUpdate) {
            user.onUpdate(updatedUser);
        }
        alert('Profile updated successfully! 🎉');
    };

    /**
     * Grants bonus XP for completing a suggested corrective action 
     * and checks for potential level-up milestones.
     */
    const handleCompleteAction = () => {
        const bonusXP = 10;
        const newXP = xp + bonusXP;
        storage.saveXP(newXP);
        setXP(newXP);
        setShowReward(false);

        // Level Up Check
        const newLevel = Math.floor(newXP / 100) + 1;
        if (newLevel > level) {
            setShowLevelUp(true);
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.5 }
            });
        }

        confetti({
            particleCount: 50,
            spread: 40,
            origin: { y: 0.7 },
            colors: ['#22C55E']
        });
    };

    /**
     * core logic for logging a sugar consumption event.
     * Calculates XP, updates streak, generates health insights, 
     * and triggers UI/UX feedback (confetti/sound).
     */
    const handleLogSugar = (option) => {
        try {
            const now = new Date();
            const bonusXP = Math.floor(Math.random() * 6); // 0-5
            const baseXP = 5;
            const totalXP = baseXP + bonusXP;
            const newXP = xp + totalXP;

            // Check for Level Up
            const newLevel = Math.floor(newXP / 100) + 1;
            if (newLevel > level) {
                setShowLevelUp(true);
                try {
                    confetti({
                        particleCount: 200,
                        spread: 120,
                        origin: { y: 0.5 },
                        colors: ['#3B82F6', '#F97316', '#22C55E', '#A855F7']
                    });
                } catch (e) {
                    console.warn('Confetti error (level up):', e);
                }
            }

            // Update Streak (Fixed Date Logic)
            const lastDate = streak.lastDate ? new Date(streak.lastDate) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let newCount = streak.count;
            if (!lastDate) {
                // First log ever
                newCount = 1;
            } else {
                const lastDateNormalized = new Date(lastDate);
                lastDateNormalized.setHours(0, 0, 0, 0);
                const daysDifference = (today - lastDateNormalized) / (1000 * 60 * 60 * 24);

                if (daysDifference === 1) {
                    // Logged yesterday, increment streak
                    newCount += 1;
                } else if (daysDifference === 0) {
                    // Logged today already, keep streak same
                    newCount = streak.count;
                } else {
                    // Missed a day, reset to 1
                    newCount = 1;
                }
            }

            const newStreak = { count: newCount, lastDate: now.toISOString() };
            storage.saveStreak(newStreak);
            setStreak(newStreak);

            // Notify if streak was reset
            if (newCount === 1 && streak.count > 1) {
                setStreakNotification('🔥 Streak Reset: Start fresh today!');
                const timer = setTimeout(() => setStreakNotification(null), 3000);
                return () => clearTimeout(timer);
            }

            // Check for Streak Milestones (7, 30, 100 days with XP bonus)
            const milestone = insightEngine.checkStreakMilestone(newCount);
            if (milestone && milestone.milestone) {
                setMilestoneData(milestone);
                setShowMilestone(true);
                // Add milestone bonus XP
                const bonusXP = milestone.bonus;
                const milestoneXP = xp + bonusXP;
                storage.saveXP(milestoneXP);
                setXP(milestoneXP);
            }

            // Save Log & XP
            const updatedLogs = storage.saveLog({ type: option.id, xp: totalXP });
            setLogs(updatedLogs);
            storage.saveXP(newXP);
            setXP(newXP);

            // Check for Signup Prompt (after saving log)
            if (updatedLogs.length >= 2 && !isSubscribed) {
                // Show signup after a brief delay so reward popover displays first
                setTimeout(() => setShowSignup(true), 800);
            }

            // Insight (with explainability & early logging bonus)
            const riskScore = insightEngine.calculateRiskScore(safeUser, now, dailyData);
            const recommendation = insightEngine.getRecommendation(riskScore, safeUser, dailyData);

            // Add bonus XP for early logging (before 6pm = +3 XP)
            const earlyBonusXP = now.getHours() < 18 ? 3 : 0;
            const totalWithBonus = totalXP + earlyBonusXP;

            setLastAction({ ...recommendation, xp: totalWithBonus });

            // UI Feedback
            setShowReward(true);
            try {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3B82F6', '#F97316', '#22C55E']
                });
            } catch (e) {
                console.warn('Confetti error (log):', e);
            }

            // Success Sound (Enhanced with fallback)
            const playSuccessSound = async () => {
                try {
                    // Use Web Audio API as primary method
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

                    // Create smooth, warm success melody
                    const createNote = (freq, startTime, duration, attackTime) => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();

                        osc.type = 'sine'; // Smooth sine wave
                        osc.frequency.value = freq;
                        osc.connect(gain);
                        gain.connect(audioContext.destination);

                        // Smooth attack-sustain-release envelope
                        gain.gain.setValueAtTime(0, startTime);
                        gain.gain.linearRampToValueAtTime(0.2, startTime + attackTime);
                        gain.gain.setValueAtTime(0.2, startTime + duration - 0.1);
                        gain.gain.linearRampToValueAtTime(0, startTime + duration);

                        osc.start(startTime);
                        osc.stop(startTime + duration);
                    };

                    const now = audioContext.currentTime;

                    // Warm ascending major pentatonic melody (lower, pleasant range)
                    createNote(196.00, now, 0.35, 0.08);      // G3
                    createNote(246.94, now + 0.2, 0.35, 0.08); // B3
                    createNote(293.66, now + 0.4, 0.40, 0.08); // D4
                    createNote(392.00, now + 0.6, 0.60, 0.08); // G4 (warm finale)
                } catch (e) {
                    // Fallback: Try HTMLAudioElement
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/success-1-629.wav');
                        audio.volume = 0.3;
                        audio.play().catch(() => {
                            console.log('Audio playback not supported in this context');
                            setAudioSupported(false);
                        });
                    } catch (err) {
                        console.log('Audio initialization failed silently');
                    }
                }
            };

            if (audioSupported) {
                playSuccessSound();
            }
        } catch (error) {
            console.error('Error in handleLogSugar:', error);
            alert('Error logging sugar! Check console for details.');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'history':
                return (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 py-4"
                    >
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">📝 Your History</h2>
                        <div className="space-y-3">
                            {[...logs].reverse().map((log, index) => {
                                const option = SUGAR_OPTIONS.find(o => o.id === log.type);
                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05, ease: 'easeOut', duration: 0.4 }}
                                        whileHover={{ scale: 1.02, x: 5, transition: { duration: 0.3 } }}
                                        className={`p-4 rounded-2xl border shadow-lg hover:shadow-xl transition-all flex items-center gap-4 ${option?.color || 'bg-gradient-to-r from-slate-100 to-slate-50'} border-white/30`}
                                    >
                                        <motion.div
                                            className={`p-3 rounded-xl backdrop-blur-sm`}
                                            animate={{ scale: [1, 1.08, 1] }}
                                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                        >
                                            {option ? <option.icon size={24} /> : <Plus size={24} />}
                                        </motion.div>
                                        <div className="flex-1">
                                            <p className="font-black capitalize text-base text-white drop-shadow">{log.type.replace('_', ' ')}</p>
                                            <p className="text-xs font-medium text-white/80 drop-shadow">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <motion.div
                                            className="text-right"
                                            whileHover={{ scale: 1.2 }}
                                        >
                                            <p className="text-white font-black text-lg drop-shadow">+{log.xp}</p>
                                            <p className="text-xs font-bold text-white/80 drop-shadow">XP</p>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                            {logs.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border-2 border-dashed border-purple-200"
                                >
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-5xl mb-4"
                                    >
                                        🛡️
                                    </motion.div>
                                    <p className="text-slate-600 font-black text-lg">Ready to log your first sugar intake?</p>
                                    <p className="text-slate-500 text-sm mt-2">Go back to home and click any button to start!</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
            case 'rewards':
                return (
                    <motion.div
                        key="rewards"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 py-4"
                    >
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 mb-6">🏆 Your Achievements</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <motion.div
                                whileHover={{ scale: 1.05, y: -10 }}
                                className="bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 p-6 rounded-3xl text-center shadow-2xl border border-purple-300/50 relative overflow-hidden"
                            >
                                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <motion.div
                                    animate={{ rotate: [0, 8, -8, 0], y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                    className="text-5xl mb-3"
                                >
                                    <Trophy size={40} className="text-white mx-auto" />
                                </motion.div>
                                <p className="text-xs font-bold text-purple-100 uppercase mb-1 tracking-wider">Current Level</p>
                                <p className="text-5xl font-black text-white drop-shadow-lg">{level}</p>
                                <p className="text-xs text-purple-100 mt-2">🎯 Progress: {progress}%</p>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -10 }}
                                className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-6 rounded-3xl text-center shadow-2xl border border-orange-300/50 relative overflow-hidden"
                            >
                                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <motion.div
                                    animate={{ rotate: [0, 12, -12, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                    className="text-5xl mb-3"
                                >
                                    <Flame size={40} className="text-white mx-auto" fill="white" />
                                </motion.div>
                                <p className="text-xs font-bold text-orange-100 uppercase mb-1 tracking-wider">Streak</p>
                                <p className="text-5xl font-black text-white drop-shadow-lg">{streak.count}</p>
                                <p className="text-xs text-orange-100 mt-2">🔥 Days Strong</p>
                            </motion.div>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-800 mb-4">📈 Stats & Metrics</h3>
                            <div className="space-y-3">
                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-2xl border border-purple-200/50 flex justify-between items-center group hover:shadow-lg transition-all"
                                >
                                    <div>
                                        <p className="text-xs font-bold text-purple-600 uppercase">Total XP</p>
                                        <p className="text-sm text-slate-600 mt-1">Experience Points Earned</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-purple-600">{xp}</p>
                                        <p className="text-xs text-purple-500 font-bold">✨ XP</p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ x: 10 }}
                                    className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-200/50 flex justify-between items-center group hover:shadow-lg transition-all"
                                >
                                    <div>
                                        <p className="text-xs font-bold text-orange-600 uppercase">Items Logged</p>
                                        <p className="text-sm text-slate-600 mt-1">Sugar Events Tracked</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-orange-600">{logs.length}</p>
                                        <p className="text-xs text-orange-500 font-bold">🛡️ Logs</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Habit Calendar */}
                        <div className="px-6 mb-6">
                            <h3 className="text-xl font-black text-slate-800 mb-4">📅 Last 7 Days Activity</h3>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ ease: 'easeOut', duration: 0.5 }}
                                className="grid grid-cols-7 gap-2 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl border border-purple-200/50"
                            >
                                {[...Array(7)].map((_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() - (6 - i));
                                    const dateStr = date.toISOString().split('T')[0];
                                    const dayLogged = logs.some(log => log.timestamp.startsWith(dateStr));
                                    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

                                    return (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${dayLogged
                                                ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-blue-400/50'
                                                : 'bg-white/50 text-slate-400'
                                                }`}
                                        >
                                            <p className="text-xs font-black uppercase mb-1">{dayName}</p>
                                            <p className="text-lg font-black">{dayLogged ? '✓' : '-'}</p>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                            <p className="text-xs text-slate-500 mt-3 text-center">✓ = logged | - = rest day</p>
                        </div>

                        {!isSubscribed && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                whileHover={{ scale: 1.02 }}
                                className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50 relative overflow-hidden border border-purple-400/50"
                            >
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black mb-2">✨ Claim Your Progress!</h3>
                                    <p className="text-purple-100 text-sm mb-6 font-medium">Create a free account to backup your data and unlock premium health reports.</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                        whileTap={{ scale: 0.95, transition: { duration: 0.15 } }}
                                        onClick={() => setShowSignup(true)}
                                        className="w-full py-4 bg-white text-purple-600 font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all text-lg"
                                    >
                                        🚀 Create Account Now
                                    </motion.button>
                                </div>

                                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                            </motion.div>
                        )}
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* XP Bar */}
                        <div className="px-6 mb-8 mt-6">
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-2xl border border-purple-200/50 shadow-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Level Progress</p>
                                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                                            Level {level}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-500">Total XP</p>
                                        <p className="text-2xl font-black text-purple-600">{xp}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1">
                                        <span>{progress}%</span>
                                        <span className="text-purple-600">{progress}/100 to Level {level + 1}</span>
                                    </div>
                                    <div className="h-5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300/50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full shine"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Activity */}
                        <div className="px-6 mb-8">
                            <h2 className="text-xl font-black text-slate-800 mb-4">📊 Daily Activity</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-2xl border border-cyan-200/50 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-center gap-2 text-cyan-600 mb-3">
                                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                            <Footprints size={20} />
                                        </motion.div>
                                        <span className="text-xs font-bold uppercase">Steps Today</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={dailyData.steps}
                                        onChange={(e) => handleDailyDataUpdate('steps', e.target.value)}
                                        className="text-3xl font-black text-cyan-600 bg-transparent outline-none w-full"
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">👟 Goal: 10,000 steps</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-200/50 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-center gap-2 text-indigo-600 mb-3">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                            <Trophy size={20} />
                                        </motion.div>
                                        <span className="text-xs font-bold uppercase">Sleep Hours</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={dailyData.sleep}
                                        onChange={(e) => handleDailyDataUpdate('sleep', e.target.value)}
                                        className="text-3xl font-black text-indigo-600 bg-transparent outline-none w-full"
                                        placeholder="8"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">😴 Goal: 8 hours</p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Motivational Quote */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-6 mb-6 bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 p-4 rounded-2xl border-2 border-purple-200/50 shadow-lg"
                        >
                            <motion.p
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="text-center font-black text-lg text-purple-700 drop-shadow-sm"
                            >
                                {motivationalQuote}
                            </motion.p>
                        </motion.div>

                        {/* Quick Log */}
                        <div className="px-6 mb-4">
                            <div className="flex items-center gap-3 mb-5">
                                <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Log Sugar</h2>
                                <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full">Tap to log</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {SUGAR_OPTIONS.map((opt, idx) => (
                                    <motion.button
                                        key={opt.id}
                                        whileHover={{ scale: 1.08, y: -5 }}
                                        whileTap={{ scale: 0.92 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                        onClick={() => handleLogSugar(opt)}
                                        className={`p-6 rounded-2xl ${opt.color} flex flex-col items-center justify-center gap-3 shadow-2xl border border-white/30 hover:border-white/60 transition-all backdrop-blur-sm`}
                                    >
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ repeat: Infinity, duration: 2, delay: idx * 0.1 }}
                                        >
                                            <opt.icon size={40} strokeWidth={1.5} />
                                        </motion.div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-black text-base">{opt.label}</span>
                                            <span className="text-[10px] opacity-75 font-medium">+5-10 XP</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-32">
            {/* Header */}
            <div className="p-6 pt-8 pb-4 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl mx-4 mt-2 mb-6 shadow-2xl border border-blue-400/20 relative">
                {/* Edit Profile Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowProfileEdit(true)}
                    className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 text-white hover:bg-white/30 transition-all z-10"
                >
                    <Pencil size={18} />
                </motion.button>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-2">Welcome back</p>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 mb-3">
                            {user.gender === 'Male' ? '🛡️ Shield Mode' : '✨ Protection Mode'}
                        </h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold ${dailyData.sleep < 6 || dailyData.steps < 4000
                                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                                    : 'bg-green-500/20 text-green-300 border border-green-500/50'
                                    }`}
                            >
                                {dailyData.sleep < 6 || dailyData.steps < 4000 ? '⚠️ Vulnerable' : '💚 Strong'}
                            </motion.div>
                            <span className="text-xs text-blue-200">Status</span>
                        </div>
                    </div>
                    {activeTab !== 'rewards' && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-end gap-2"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-75"></div>
                                <div className="relative flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 px-5 py-3 rounded-2xl text-white font-black shadow-2xl border border-orange-300/50">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.8 }}
                                    >
                                        <Flame size={24} fill="currentColor" />
                                    </motion.div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl">{streak.count}</span>
                                        <span className="text-xs uppercase tracking-wider">Day Streak</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <div key={activeTab}>
                    {renderContent()}
                </div>
            </AnimatePresence>

            {/* Recommendation Popover */}
            <AnimatePresence>
                {showReward && lastAction && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                        className="fixed inset-x-4 bottom-28 z-50 p-6 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 text-white shadow-2xl shadow-blue-500/30 border border-cyan-300/20 backdrop-blur-xl"
                    >
                        <div className="flex items-start gap-4">
                            <motion.div
                                animate={{ rotate: [0, 20, -20, 0], y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm text-white flex-shrink-0"
                            >
                                <Trophy size={32} strokeWidth={2} />
                            </motion.div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <motion.h3
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="font-black text-2xl text-white drop-shadow-lg"
                                    >
                                        🎉 +{lastAction.xp} XP!
                                    </motion.h3>
                                    <button
                                        onClick={() => setShowReward(false)}
                                        className="text-white/70 hover:text-white transition-colors text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/90 text-sm mb-3 font-semibold"
                                >
                                    {lastAction.insight}
                                </motion.p>

                                {lastAction.reason && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.35 }}
                                        className="text-xs text-white/70 bg-white/10 px-3 py-2 rounded-lg mb-4 italic border border-white/20"
                                    >
                                        💭 Why: {lastAction.reason}
                                    </motion.p>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/15 backdrop-blur-sm border border-white/30 p-4 rounded-2xl flex items-center gap-3 mb-5"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                                        <Footprints size={22} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-white/80 uppercase tracking-wider">💡 Quick Action</p>
                                        <p className="text-sm font-bold text-white">{lastAction.action}</p>
                                    </div>
                                </motion.div>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -3, transition: { duration: 0.2 } }}
                                    whileTap={{ scale: 0.95, transition: { duration: 0.15 } }}
                                    onClick={handleCompleteAction}
                                    className="w-full py-3 px-4 bg-white text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 font-black text-base rounded-2xl hover:shadow-lg hover:shadow-white/20 transition-all flex items-center justify-center gap-2 border-2 border-white font-bold text-white"
                                >
                                    <span>Let's Do It! 💪</span>
                                    <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-xl text-xs text-white font-bold">+10 XP</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Level Up Modal */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-lg"
                    >
                        <motion.div
                            initial={{ scale: 0.3, opacity: 0, y: 100 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.3, opacity: 0, y: 100 }}
                            transition={{ type: "spring", damping: 15, stiffness: 250, duration: 0.5 }}
                            className="rounded-4xl bg-gradient-to-br from-purple-500 via-blue-600 to-purple-700 text-white text-center p-10 max-w-md w-full shadow-2xl shadow-purple-500/30 border border-purple-300/20 relative overflow-hidden"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                            />

                            <div className="relative z-10">
                                <motion.div
                                    animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                    className="h-32 w-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 text-white relative border-4 border-white/30"
                                >
                                    <Trophy size={64} strokeWidth={1.5} />
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], rotate: [0, 360, 360] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-orange-400/30 rounded-full"
                                    />
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-5xl font-black mb-3 drop-shadow-xl text-white"
                                >
                                    🎊 LEVEL UP! 🎊
                                </motion.h2>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-black text-yellow-200 mb-6 drop-shadow-lg"
                                >
                                    LEVEL {level}
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-white/90 mb-8 text-base px-2 font-semibold leading-relaxed"
                                >
                                    🛡️ You're becoming unstoppable! Your shield against sugar is growing stronger. Keep up the momentum!
                                </motion.p>

                                <motion.button
                                    whileHover={{ scale: 1.08, y: -5 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => setShowLevelUp(false)}
                                    className="w-full py-4 px-6 bg-white text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-black text-lg rounded-2xl hover:shadow-lg hover:shadow-white/20 transition-all border-2 border-white font-bold text-white"
                                >
                                    Continue the Journey 🚀
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Milestone Achievement Modal */}
            <AnimatePresence>
                {showMilestone && milestoneData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[125] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-lg"
                    >
                        <motion.div
                            initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.2, opacity: 0, rotate: 20 }}
                            transition={{ type: "spring", damping: 12, stiffness: 300 }}
                            className="rounded-4xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white text-center p-10 max-w-md w-full shadow-2xl shadow-orange-500/50 border border-yellow-300/30 relative overflow-hidden"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -right-20 w-40 h-40 bg-white/15 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                                className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-300/15 rounded-full blur-3xl"
                            />

                            <div className="relative z-10">
                                {/* Gift Box Animation */}
                                <motion.div
                                    initial={{ y: -50 }}
                                    animate={{ y: [-50, -20, -50] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="text-7xl mb-6 drop-shadow-2xl"
                                >
                                    🎁
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl font-black mb-2 drop-shadow-lg"
                                >
                                    🎊 ACHIEVEMENT! 🎊
                                </motion.h2>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-black text-yellow-100 mb-6 drop-shadow-lg"
                                >
                                    {milestoneData.message}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-8 border-2 border-white/30"
                                >
                                    <p className="text-sm font-bold text-white/80 mb-2">BONUS REWARD</p>
                                    <p className="text-5xl font-black text-yellow-100 drop-shadow-lg">+{milestoneData.bonus} XP</p>
                                    <p className="text-sm text-white/80 mt-2">Keep your streak going! 🔥</p>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-white/90 mb-8 text-sm px-2 font-semibold leading-relaxed"
                                >
                                    {milestoneData.message === '🎉 7-Day Streak!' && 'You\'re on fire! 7 days of consistent effort! 🔥'}
                                    {milestoneData.message === '🏆 30-Day Legend!' && 'Legendary commitment! 30 days of unstoppable progress! 👑'}
                                    {milestoneData.message === '👑 100-Day Master!' && 'LEGENDARY STATUS! 100 days of pure mastery! You are a true champion! 💪'}
                                </motion.p>

                                <motion.button
                                    whileHover={{ scale: 1.08, y: -5 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => setShowMilestone(false)}
                                    className="w-full py-4 px-6 bg-white text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 font-black text-lg rounded-2xl hover:shadow-lg hover:shadow-white/30 transition-all border-2 border-white font-bold text-white"
                                >
                                    Claim Reward! 🎯
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Signup Modal */}
            <AnimatePresence>
                {showSignup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-lg"
                    >
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: 50 }}
                            transition={{ type: "spring", damping: 15, stiffness: 300 }}
                            className="rounded-4xl bg-gradient-to-br from-rose-500 via-pink-600 to-orange-600 text-white text-center p-8 max-w-md w-full shadow-2xl shadow-rose-500/30 border border-rose-300/20 relative overflow-hidden"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                            />

                            <div className="relative z-10">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 text-white border-3 border-white/40"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 3 }}
                                    >
                                        <Trophy size={40} strokeWidth={1.5} />
                                    </motion.div>
                                </motion.div>

                                <motion.h3
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-black text-white mb-3 drop-shadow-lg"
                                >
                                    💎 Unlock Premium
                                </motion.h3>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/90 mb-8 text-sm font-semibold leading-relaxed px-2"
                                >
                                    You've logged {logs.length} items! Create an account to unlock long-term trends, personalized insights, and advanced health reports.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-col gap-3 mb-4"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSignup}
                                        className="w-full py-4 px-6 bg-white text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 font-black text-base rounded-2xl border-2 border-white hover:shadow-lg hover:shadow-white/20 transition-all font-bold text-white"
                                    >
                                        Create Account Now ✨
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowSignup(false)}
                                        className="w-full py-3 px-6 bg-white/10 backdrop-blur-sm text-white font-bold text-sm rounded-2xl border border-white/30 hover:bg-white/20 transition-all"
                                    >
                                        Maybe Later
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Streak Reset Notification */}
            <AnimatePresence>
                {streakNotification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-6 left-6 right-6 z-50 p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl shadow-xl"
                    >
                        <p className="font-bold text-center">{streakNotification}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Edit Modal - Onboarding Style */}
            <AnimatePresence>
                {showProfileEdit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-lg"
                    >
                        {/* Animated Background */}
                        <motion.div
                            animate={{ rotate: 360, y: [0, 25, 0] }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ rotate: -360, y: [0, -25, 0] }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl"
                        />

                        <motion.div
                            initial={{ scale: 0.7, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: 50 }}
                            transition={{ type: "spring", damping: 15, stiffness: 300 }}
                            className="w-full max-w-md relative z-10"
                        >
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-8"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                    className="text-4xl mb-3"
                                >
                                    ✏️
                                </motion.div>
                                <h3 className="text-2xl font-black text-white drop-shadow-lg">Update Profile</h3>
                                <p className="text-sm text-white/60 font-medium mt-1">Update your details anytime</p>
                            </motion.div>

                            {/* Form Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 p-6 text-white shadow-2xl border border-white/10"
                            >
                                {/* Age Input */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="mb-4"
                                >
                                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 block">🎂 Age</label>
                                    <input
                                        type="number"
                                        value={profileForm.age}
                                        onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                                        placeholder="Enter your age"
                                        className="w-full p-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm focus:border-white focus:ring-0 outline-none transition-all text-lg text-white placeholder-white/50 font-bold"
                                    />
                                </motion.div>

                                {/* Height Input */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-4"
                                >
                                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 block">📏 Height (cm)</label>
                                    <input
                                        type="number"
                                        value={profileForm.height}
                                        onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                                        placeholder="Enter height in cm"
                                        className="w-full p-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm focus:border-white focus:ring-0 outline-none transition-all text-lg text-white placeholder-white/50 font-bold"
                                    />
                                </motion.div>

                                {/* Weight Input */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="mb-4"
                                >
                                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 block">⚖️ Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={profileForm.weight}
                                        onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                                        placeholder="Enter weight in kg"
                                        className="w-full p-4 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm focus:border-white focus:ring-0 outline-none transition-all text-lg text-white placeholder-white/50 font-bold"
                                    />
                                </motion.div>

                                {/* Gender Selection */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-6"
                                >
                                    <label className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 block">👤 Gender</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {GENDER_OPTIONS.map((opt, idx) => (
                                            <motion.button
                                                key={opt}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.35 + idx * 0.05 }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setProfileForm({ ...profileForm, gender: opt })}
                                                className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${profileForm.gender === opt
                                                        ? 'border-white bg-white/30 backdrop-blur-sm text-white'
                                                        : 'border-white/30 bg-white/10 backdrop-blur-sm text-white/70 hover:border-white/50'
                                                    }`}
                                            >
                                                {opt}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex gap-3"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowProfileEdit(false)}
                                        className="flex-1 py-3 px-4 bg-white/10 backdrop-blur-sm text-white font-bold text-sm rounded-2xl border border-white/30 hover:bg-white/20 transition-all"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            handleProfileUpdate();
                                            setShowProfileEdit(false);
                                        }}
                                        className="flex-1 py-3 px-4 bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-black text-base rounded-2xl border-2 border-white hover:shadow-lg hover:shadow-white/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Save 💾
                                    </motion.button>
                                </motion.div>
                            </motion.div>

                            {/* Motivational Text */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center text-white/50 text-xs mt-6 font-medium"
                            >
                                🎯 Keep your profile updated for better insights
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            <div className="fixed bottom-6 inset-x-6 h-24 bg-gradient-to-t from-slate-900/95 to-slate-800/90 backdrop-blur-2xl border border-slate-700/50 rounded-3xl flex items-center justify-around px-4 shadow-2xl z-40 ring-1 ring-white/10">
                <motion.button
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'home'
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <motion.div
                        animate={activeTab === 'home' ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ repeat: activeTab === 'home' ? Infinity : undefined, duration: 2 }}
                    >
                        <Plus size={26} strokeWidth={2} />
                    </motion.div>
                    <span className="text-xs font-black uppercase tracking-wider">Log</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'history'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <motion.div
                        animate={activeTab === 'history' ? { y: [0, -5, 0] } : { y: 0 }}
                        transition={{ repeat: activeTab === 'history' ? Infinity : undefined, duration: 2 }}
                    >
                        <MapPin size={26} strokeWidth={2} />
                    </motion.div>
                    <span className="text-xs font-black uppercase tracking-wider">History</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('rewards')}
                    className={`flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'rewards'
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/50 scale-105'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    <motion.div
                        animate={activeTab === 'rewards' ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
                        transition={{ repeat: activeTab === 'rewards' ? Infinity : undefined, duration: 2 }}
                    >
                        <Trophy size={26} strokeWidth={2} />
                    </motion.div>
                    <span className="text-xs font-black uppercase tracking-wider">Rewards</span>
                </motion.button>
            </div>
        </div>
    );
});

export default Dashboard;
