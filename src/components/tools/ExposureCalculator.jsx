import React, { useState } from 'react';
import { Car, Footprints, Bike, Zap, AlertTriangle } from 'lucide-react';

const RESPIRATORY_RATES = {
    car: { rate: 7, label: 'Commute', icon: Car },
    walk: { rate: 15, label: 'Walking', icon: Footprints },
    bike: { rate: 30, label: 'Biking', icon: Bike },
    run: { rate: 50, label: 'Running', icon: Zap }
};

const ExposureCalculator = ({ pm25 }) => {
    const [duration, setDuration] = useState(30);
    const [mode, setMode] = useState('walk');

    // Formula: Total Inhaled (µg) = (PM2.5 * Rate * Minutes) / 1000
    // Rate is in Liters/min. PM2.5 is in µg/m³. 
    // Note: 1 m³ = 1000 Liters. 
    // So (µg/m³ * L/min * min) -> need to convert L to m³. 
    // L/1000 = m³. 
    // So (PM2.5 * (Rate/1000) * Minutes) = µg inhaled.

    // Wait, let's verify units.
    // PM2.5 = µg/m³
    // Volume Inhaled = Rate (L/min) * Time (min) = Total Liters
    // Total Liters / 1000 = Total m³
    // Total µg = Total m³ * PM2.5
    // Result = (Rate * Time / 1000) * PM2.5

    const rate = RESPIRATORY_RATES[mode].rate;
    const inhaled = ((pm25 * rate * duration) / 1000).toFixed(1);
    const isHighRisk = parseFloat(inhaled) > 50;

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="text-primary" size={20} />
                    <h3 className="font-bold text-lg">Eco-Nav</h3>
                </div>
                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/40 font-mono uppercase">Exposure Calc</span>
            </div>

            {/* Mode Selection */}
            <div className="grid grid-cols-4 gap-2">
                {Object.entries(RESPIRATORY_RATES).map(([key, data]) => (
                    <button
                        key={key}
                        onClick={() => setMode(key)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${mode === key
                                ? 'bg-primary/20 border-primary/50 text-white'
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                            }`}
                    >
                        <data.icon size={20} className="mb-1" />
                        <span className="text-[9px] font-bold uppercase">{data.label}</span>
                    </button>
                ))}
            </div>

            {/* Duration Slider */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono uppercase text-white/60">
                    <span>Duration</span>
                    <span>{duration} min</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Result Display */}
            <div className="mt-auto flex items-end justify-between p-4 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Est. PM2.5 Inhaled</div>
                    <div className="text-4xl font-black tracking-tighter flex items-baseline gap-1">
                        {inhaled} <span className="text-sm font-medium text-white/40">µg</span>
                    </div>
                </div>

                {isHighRisk && (
                    <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-xs uppercase animate-pulse">
                            <AlertTriangle size={14} />
                            High Risk
                        </div>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-white/30 leading-relaxed text-center">
                Based on current PM2.5 of {pm25} µg/m³. Limit exposure to reduce intake.
            </p>
        </div>
    );
};

export default ExposureCalculator;
