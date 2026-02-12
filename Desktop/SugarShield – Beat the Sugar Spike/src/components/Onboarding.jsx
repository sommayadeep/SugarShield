import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { calculateBMI, storage } from '../utils/storage';

const steps = [
    { id: 'age', label: '🎂 How old are you?', type: 'number', placeholder: 'Age in years', emoji: '🎂' },
    { id: 'height', label: '📏 How tall are you?', type: 'number', placeholder: 'Height in cm', emoji: '📏' },
    { id: 'weight', label: '⚖️ How much do you weigh?', type: 'number', placeholder: 'Weight in kg', emoji: '⚖️' },
    { id: 'gender', label: '👤 What is your gender?', type: 'select', options: ['👨 Male', '👩 Female', '🌈 Other'], emoji: '👤' },
];

export default function Onboarding({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        age: '',
        height: '',
        weight: '',
        gender: '',
    });

    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            const bmi = calculateBMI(formData.weight, formData.height);
            const userData = { ...formData, bmi };
            storage.saveUserData(userData);
            onComplete(userData);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [step.id]: e.target.value });
    };

    const isStepValid = formData[step.id] !== '';

    const getGradientByStep = () => {
        switch(currentStep) {
            case 0: return 'from-cyan-500 via-blue-600 to-purple-700';
            case 1: return 'from-blue-500 via-purple-600 to-pink-700';
            case 2: return 'from-purple-500 via-pink-600 to-rose-700';
            case 3: return 'from-pink-500 via-rose-600 to-orange-700';
            default: return 'from-cyan-500 to-blue-700';
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
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

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Branding */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.h1
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-2 drop-shadow-xl"
                    >
                        🛡️
                    </motion.h1>
                    <h2 className="text-2xl font-black text-white mb-2">SugarShield</h2>
                    <p className="text-sm text-white/70 font-semibold">Beat the Sugar Spike</p>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-12 px-2"
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-black text-white/80 uppercase tracking-wider">Step {currentStep + 1} of {steps.length}</span>
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className={`text-2xl`}
                        >
                            {step.emoji}
                        </motion.span>
                    </div>
                    <div className="flex gap-2">
                        {steps.map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                                    i < currentStep
                                        ? `bg-gradient-to-r ${getGradientByStep()}`
                                        : i === currentStep
                                        ? `bg-gradient-to-r ${getGradientByStep()} shadow-lg`
                                        : 'bg-slate-700'
                                }`}
                            />
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ type: "spring", damping: 22, stiffness: 350, duration: 0.5 }}
                        className={`rounded-3xl bg-gradient-to-br ${getGradientByStep()} p-8 text-white shadow-2xl border border-white/10`}
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, ease: 'easeOut', duration: 0.4 }}
                            className="text-3xl font-black mb-8 drop-shadow-lg"
                        >
                            {step.label}
                        </motion.h1>

                        {step.type === 'number' ? (
                            <motion.input
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                type="number"
                                value={formData[step.id]}
                                onChange={handleChange}
                                placeholder={step.placeholder}
                                className="w-full p-5 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm focus:border-white focus:ring-0 outline-none transition-all text-xl text-white placeholder-white/50 font-bold"
                                autoFocus
                            />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 gap-3"
                            >
                                {step.options.map((opt, idx) => (
                                    <motion.button
                                        key={opt}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
                                        whileHover={{ scale: 1.05, x: 10, transition: { duration: 0.2 } }}
                                        whileTap={{ scale: 0.95, transition: { duration: 0.15 } }}
                                        onClick={() => setFormData({ ...formData, [step.id]: opt })}
                                        className={`p-5 rounded-2xl border-2 transition-all text-lg font-bold ${
                                            formData[step.id] === opt
                                                ? 'border-white bg-white/20 backdrop-blur-sm text-white scale-105'
                                                : 'border-white/30 bg-white/10 backdrop-blur-sm text-white/80 hover:border-white/50 hover:text-white'
                                        }`}
                                    >
                                        {opt}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-10 flex justify-between gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={`p-4 rounded-2xl border-2 border-white/30 flex items-center justify-center transition-all backdrop-blur-sm ${
                                    currentStep === 0
                                        ? 'opacity-0 pointer-events-none'
                                        : 'hover:bg-white/20 text-white'
                                }`}
                            >
                                <ChevronLeft size={24} strokeWidth={3} />
                            </motion.button>

                            <motion.button
                                whileHover={isStepValid ? { scale: 1.08, y: -5, transition: { duration: 0.2 } } : {}}
                                whileTap={isStepValid ? { scale: 0.92, transition: { duration: 0.15 } } : {}}
                                onClick={handleNext}
                                disabled={!isStepValid}
                                className={`flex-1 bg-white text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 font-black text-lg rounded-2xl flex items-center justify-center gap-3 border-2 border-white transition-all py-4 ${
                                    !isStepValid ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-white/20'
                                }`}
                            >
                                {currentStep === steps.length - 1 ? 'Let\'s Begin' : 'Next'}
                                <motion.div
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                                >
                                    <ChevronRight size={24} strokeWidth={3} className="text-white" />
                                </motion.div>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Motivational Message */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-white/60 text-xs mt-10 font-medium"
                >
                    🎯 Just 4 quick steps to get your personalized health shield ready
                </motion.p>
            </div>
        </div>
    );
}
