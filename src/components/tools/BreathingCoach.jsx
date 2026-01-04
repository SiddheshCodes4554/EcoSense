import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Square, AlertOctagon, Camera, ChevronRight } from 'lucide-react';
import VisionBreathing from '../cv/VisionBreathing';

const BreathingCoach = ({ aqi }) => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale
    const [timeLeft, setTimeLeft] = useState(0);
    const [showVision, setShowVision] = useState(false);

    const isUnsafe = aqi > 150;

    useEffect(() => {
        let timer;
        if (isActive && !isUnsafe && !showVision) {
            // ... existing cycle logic ...
            const runCycle = async () => {
                // Inhale (4s)
                setPhase('inhale');
                setTimeLeft(4);
                await new Promise(r => setTimeout(r, 4000));
                if (!isActive) return;
                // Hold (7s)
                setPhase('hold');
                setTimeLeft(7);
                await new Promise(r => setTimeout(r, 7000));
                if (!isActive) return;
                // Exhale (8s)
                setPhase('exhale');
                setTimeLeft(8);
                await new Promise(r => setTimeout(r, 8000));
                if (isActive) runCycle();
            };
            runCycle();
        } else {
            setPhase('ready');
        }
        return () => clearTimeout(timer);
    }, [isActive, isUnsafe, showVision]);

    if (showVision) {
        return <VisionBreathing onClose={() => setShowVision(false)} />;
    }

    return (
        <div className="flex flex-col gap-6 h-full relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Wind className="text-secondary" />
                        Pulmonary Coach
                    </h2>
                    <p className="text-white/60 text-sm">Enhance lung capacity</p>
                </div>
            </div>

            {/* Smart AI Mode Launcher */}
            <button
                onClick={() => setShowVision(true)}
                className="w-full mb-6 p-6 rounded-2xl bg-gradient-to-r from-secondary/20 to-primary/20 hover:from-secondary/30 hover:to-primary/30 border border-secondary/30 transition-all group flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/20 rounded-full group-hover:scale-110 transition-transform">
                        <Camera size={32} className="text-secondary" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-white">Start AI Session</h3>
                        <p className="text-white/60 text-sm">Interactive posture & breathing guide</p>
                    </div>
                </div>
                <ChevronRight className="text-white/40 group-hover:translate-x-1 transition-transform" />
            </button>

            {isUnsafe ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <AlertOctagon className="text-red-500 mb-2" size={32} />
                    <h4 className="text-red-400 font-bold uppercase tracking-widest text-sm mb-2">Outdoor Hazard</h4>
                    <p className="text-xs text-white/60">Air quality is too poor for deep breathing exercises outdoors. Please go indoors first.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    {/* Breathing Circle Animation */}
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Outer Glow Ring */}
                        <motion.div
                            animate={{
                                scale: phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : 1.2,
                                opacity: phase === 'hold' ? 0.5 : 0.2,
                            }}
                            transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 7, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full bg-secondary blur-xl"
                        />

                        {/* Main Circle */}
                        <motion.div
                            animate={{
                                scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1,
                                backgroundColor: phase === 'inhale' ? '#60a5fa' : phase === 'exhale' ? '#1e3a8a' : '#3b82f6', // Light Blue -> Dark Blue
                            }}
                            transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 7, ease: "easeInOut" }}
                            className="w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] border-4 border-white/10 relative z-10"
                        >
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white uppercase tracking-widest">
                                    {phase === 'ready' ? 'START' : phase}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {!isActive && (
                        <button
                            onClick={() => setIsActive(true)}
                            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl transition-opacity hover:bg-black/30"
                        >
                            <Play className="text-white fill-white" size={48} />
                        </button>
                    )}
                </div>
            )}

            <div className="flex justify-between items-center z-10">
                <p className="text-[10px] text-white/30 truncate max-w-[200px]">
                    {phase === 'inhale' ? 'Expand your diaphragm...' : phase === 'hold' ? 'Oxygenating blood...' : phase === 'exhale' ? 'Force all air out...' : 'Tap to begin session'}
                </p>
                {isActive && (
                    <button onClick={() => setIsActive(false)} className="text-white/40 hover:text-white transition-colors">
                        <Square size={16} fill="currentColor" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default BreathingCoach;
