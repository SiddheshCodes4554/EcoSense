import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { Cigarette, Clock, AlertTriangle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// --- 3D Bio-Monitor Component ---
const BioMonitor = ({ aqi }) => {
    // Determine color based on AQI
    const color = useMemo(() => {
        if (aqi <= 50) return '#10b981'; // Healthy Green
        if (aqi <= 100) return '#f59e0b'; // Moderate Yellow
        if (aqi <= 150) return '#f97316'; // Sensitive Orange
        if (aqi <= 200) return '#ef4444'; // Unhealthy Red
        return '#7e22ce'; // Hazardous Purple
    }, [aqi]);

    // Animation speed factor (Higher AQI = Faster/Stressed breathing)
    const speed = Math.max(1, aqi / 40);
    const distort = Math.min(1, aqi / 200); // More distortion = more stress

    return (
        <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <BreathingLungs color={color} speed={speed} distort={distort} />
            </Float>
        </Canvas>
    );
};

const BreathingLungs = ({ color, speed, distort }) => {
    const ref = useRef();

    useFrame((state) => {
        // Pulsing animation
        const t = state.clock.getElapsedTime();
        ref.current.distort = 0.3 + Math.sin(t * speed) * 0.2 + (distort * 0.2);
    });

    return (
        <group>
            {/* Left Lung */}
            <Sphere args={[1, 32, 32]} position={[-0.6, 0, 0]} scale={[0.9, 1.2, 0.9]}>
                <MeshDistortMaterial ref={ref} color={color} speed={speed} distort={0.4} roughness={0.4} />
            </Sphere>
            {/* Right Lung */}
            <Sphere args={[1, 32, 32]} position={[0.6, 0, 0]} scale={[0.9, 1.2, 0.9]}>
                <MeshDistortMaterial color={color} speed={speed} distort={0.4} roughness={0.4} />
            </Sphere>
        </group>
    );
};

// --- Toxicity & Safety Components ---

const ToxicityScale = ({ pm25 }) => {
    // Berkeley Earth Rule: 22 µg/m³ PM2.5 = 1 Cigarette
    const cigarettes = (pm25 / 22).toFixed(1);
    const count = Math.min(10, Math.ceil(cigarettes));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Cigarette className="text-white/60" size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Toxicity Equivalence</h3>
            </div>

            <div className="flex flex-wrap gap-2 items-center min-h-[40px]">
                {Array.from({ length: count }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Cigarette className="text-orange-400 rotate-45" size={24} fill="currentColor" fillOpacity={0.2} />
                    </motion.div>
                ))}
                {parseFloat(cigarettes) < 0.5 && (
                    <span className="text-xs text-green-400 font-mono">Air is clean (0 cigs)</span>
                )}
            </div>

            <p className="text-xs text-white/40 leading-relaxed">
                Breathing this air for 24h is roughly equivalent to smoking <span className="text-orange-400 font-bold text-lg">{cigarettes}</span> cigarettes.
            </p>
        </div>
    );
};

const SafetyCountdown = ({ pm25, aqi }) => {
    // WHO Safe Limit: 25 µg/m³ per 24h
    // Simplified Logic: If current > 25, how many hours until we hit the 'daily dose' limit at this rate?
    // Formula: (Limit / Current) * 24

    const safeHours = pm25 > 25 ? Math.max(0, ((25 / pm25) * 24).toFixed(1)) : 24;
    const isSafe = pm25 <= 25;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Clock className="text-white/60" size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Safe Exposure Limit</h3>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center bg-white/5 rounded-full border border-white/10">
                    <span className={`text-xl font-bold ${safeHours < 4 ? 'text-red-400' : 'text-primary'}`}>
                        {isSafe ? '24+' : safeHours}
                    </span>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                        <circle
                            cx="32" cy="32" r="28"
                            stroke={safeHours < 4 ? '#ef4444' : '#10b981'}
                            strokeWidth="2"
                            fill="transparent"
                            strokeDasharray={175}
                            strokeDashoffset={175 - ((isSafe ? 24 : safeHours) / 24) * 175}
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-white/60 uppercase tracking-wider">Safe Hours Remaining</span>
                    {safeHours < 1 ? (
                        <span className="text-red-400 text-[10px] font-bold animate-pulse">DO NOT EXPOSE TO OUTDOOR AIR</span>
                    ) : (
                        <span className="text-[10px] text-white/40">Before exceeding WHO daily limits</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ImpactSection = ({ aqi, pollutants }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6">
            {/* Panel A: Bio-Monitor (3D) */}
            <div className="col-span-1 md:col-span-1 glass rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center relative border border-primary/20 bg-primary/5">
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <Activity className="text-primary" size={18} />
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Bio-Digital Twin</span>
                </div>
                <div className="w-full h-[250px] cursor-move">
                    <BioMonitor aqi={aqi} />
                </div>
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-2">
                    Respiratory Stress: {aqi > 150 ? <span className="text-red-500 animate-pulse">CRITICAL</span> : aqi > 100 ? <span className="text-orange-400">ELEVATED</span> : <span className="text-primary">NORMAL</span>}
                </div>
            </div>

            {/* Panel B: Impact Metrics */}
            <div className="col-span-1 md:col-span-2 glass rounded-2xl p-8 border border-white/10 flex flex-col justify-around gap-8">
                <ToxicityScale pm25={pollutants.pm25.value} />
                <div className="w-full h-px bg-white/5" />
                <SafetyCountdown pm25={pollutants.pm25.value} aqi={aqi} />
            </div>
        </div>
    );
};

export default ImpactSection;
