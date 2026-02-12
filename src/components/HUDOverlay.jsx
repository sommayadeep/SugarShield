import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HUDOverlay = () => {
    const [scannedData, setScannedData] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        const interval = setInterval(() => {
            const newData = `DATA_${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
            setScannedData(prev => [newData, ...prev].slice(0, 5));
        }, 1500);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Corner Brackets */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-400 opacity-60 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-pink-500 opacity-60 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-pink-500 opacity-60 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-400 opacity-60 rounded-br-lg" />

            {/* Scanning Line */}
            <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            />

            {/* Data Feed Widget - Top Right */}
            <div className="absolute top-10 right-10 flex flex-col items-end font-mono text-xs text-cyan-300 opacity-70">
                <div className="mb-2 border-b border-cyan-500/50 pb-1 px-2">SYSTEM MONITOR</div>
                {scannedData.map((data, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1 - i * 0.2, x: 0 }}
                        className="mb-1"
                    >
                        {data} :: OK
                    </motion.div>
                ))}
            </div>

            {/* Biometric Status - Bottom Left */}
            <div className="absolute bottom-10 left-10 flex flex-col font-mono text-xs text-pink-300 opacity-70">
                <div className="mb-2 border-b border-pink-500/50 pb-1 px-2 w-max">BIOMETRICS</div>
                <div className="flex gap-4">
                    <div>HR: <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>72</motion.span> BPM</div>
                    <div>O2: 98%</div>
                    <div>GLU: <span className="text-cyan-300">CALCULATING...</span></div>
                </div>
            </div>

            {/* Mouse Follower / Reticle */}
            <motion.div
                animate={{ x: mousePos.x - 20, y: mousePos.y - 20 }}
                transition={{ type: 'spring', stiffness: 800, damping: 40, mass: 0.5 }}
                className="fixed top-0 left-0 w-10 h-10 border border-cyan-400/50 rounded-full flex items-center justify-center pointer-events-none"
            >
                <div className="w-1 h-1 bg-pink-500 rounded-full" />
            </motion.div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        </div>
    );
};

export default HUDOverlay;
