import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudFog, Zap } from 'lucide-react';

const SolarEfficiency = ({ weather, pm25 }) => {
    // 1. Calculate Atmospheric Transmission Losses
    // Cloud Loss: Simple model - % Cloud Cover * 0.8 (Opacity Factor)
    // PM2.5 Loss: (Value / 500) * 30 (Max 30% loss at Hazardous)

    const cloudCover = weather?.clouds || 0;
    const pm25Value = pm25?.value || 0;

    const cloudLoss = Math.min(80, cloudCover * 0.8);
    const pollutionLoss = Math.min(30, (pm25Value / 500) * 30);

    const totalLoss = Math.min(100, cloudLoss + pollutionLoss);
    const efficiency = Math.max(0, 100 - totalLoss);

    // Energy Estimation (Standard 5kW System)
    // 5kW * 5 Peak Sun Hours = 25kWh Theoretical Daily
    const THEORETICAL_DAILY_KWH = 25;
    const actualDailyKWh = THEORETICAL_DAILY_KWH * (efficiency / 100);
    const lostKWh = THEORETICAL_DAILY_KWH - actualDailyKWh;

    // Visuals
    const getColor = (eff) => {
        if (eff >= 80) return '#fbbf24'; // Amber-400 (Sunny)
        if (eff >= 50) return '#f97316'; // Orange-500
        return '#94a3b8'; // Slate-400 (Dim)
    };

    const color = getColor(efficiency);

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sun className="text-amber-400" />
                        Solar Potential
                    </h2>
                    <p className="text-white/60 text-sm">Roof generation efficiency</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative mb-6">
                {/* Radial Gauge */}
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Track */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-white/5"
                        />
                        {/* Progress */}
                        <motion.circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke={color}
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={552}
                            initial={{ strokeDashoffset: 552 }}
                            animate={{ strokeDashoffset: 552 - (552 * efficiency) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-5xl font-black tracking-tighter"
                        >
                            {Math.round(efficiency)}%
                        </motion.span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Efficiency</span>
                    </div>
                </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                        <Cloud size={18} className="text-blue-300" />
                    </div>
                    <div>
                        <div className="text-xs text-white/40 font-bold uppercase">Cloud Loss</div>
                        <div className="text-lg font-mono font-bold text-white/90">
                            -{Math.round(cloudLoss)}%
                        </div>
                    </div>
                </div>
                <div className="glass p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                        <CloudFog size={18} className="text-gray-400" />
                    </div>
                    <div>
                        <div className="text-xs text-white/40 font-bold uppercase">Smog Loss</div>
                        <div className="text-lg font-mono font-bold text-white/90">
                            -{Math.round(pollutionLoss)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Insight */}
            <div className="glass p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start gap-3">
                    <Zap className="text-amber-400 shrink-0 mt-1" size={18} />
                    <div className="text-sm">
                        <span className="text-amber-200 font-bold">Energy Impact: </span>
                        <span className="text-white/70">
                            A standard 5kW home setup is losing roughly <span className="text-white font-bold">{lostKWh.toFixed(1)} kWh</span> today due to atmospheric conditions.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolarEfficiency;
