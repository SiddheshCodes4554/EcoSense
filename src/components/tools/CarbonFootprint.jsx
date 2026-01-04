import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Bus, Fuel, Leaf, Zap, Globe, Cpu, ChevronRight, Terminal } from 'lucide-react';
import { fetchCarbonAnalysis } from '../../services/groqService';

const OPTIONS = {
    transport: [
        { id: 'car', label: 'Car', factor: 4.6, icon: Car },
        { id: 'public', label: 'Metro/Bus', factor: 1.2, icon: Bus },
        { id: 'bike', label: 'Bike/Walk', factor: 0.1, icon: ChevronsRight } // ChevronsRight -> actually let's use Footprints or similar but keeping icons simple from lucide. Let's fix icon.
    ],
    diet: [
        { id: 'meat', label: 'Meat Eater', factor: 2.5, icon: Fuel },
        { id: 'veg', label: 'Vegetarian', factor: 1.2, icon: Leaf }
    ],
    energy: [
        { id: 'grid', label: 'Std Grid', factor: 3.0, icon: Zap },
        { id: 'green', label: 'Renewable', factor: 0.5, icon: Globe }
    ]
};

// Fix for icon issues
import { Footprints as ChevronsRight } from 'lucide-react';

const CarbonFootprint = () => {
    const [selections, setSelections] = useState({
        transport: OPTIONS.transport[0],
        diet: OPTIONS.diet[0],
        energy: OPTIONS.energy[0]
    });

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateTotal = () => {
        return (selections.transport.factor + selections.diet.factor + selections.energy.factor).toFixed(1);
    };

    const handleAudit = async () => {
        setLoading(true);
        setAnalysis(null);

        const total = calculateTotal();
        const data = {
            transport: selections.transport.label,
            diet: selections.diet.label,
            energy: selections.energy.label,
            total
        };

        const result = await fetchCarbonAnalysis(data);
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-6 h-full relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="text-accent" size={20} />
                    <h3 className="font-bold text-lg">Eco-Audit</h3>
                </div>
                <span className="text-[10px] bg-accent/10 border border-accent/20 px-2 py-1 rounded text-accent font-mono uppercase">Instant AI</span>
            </div>

            {/* Input Grid */}
            <div className="space-y-4">
                {Object.entries(OPTIONS).map(([category, opts]) => (
                    <div key={category} className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest">{category}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {opts.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelections(prev => ({ ...prev, [category]: opt }))}
                                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${selections[category].id === opt.id
                                        ? 'bg-accent/20 border-accent/50 text-white'
                                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                        }`}
                                >
                                    <opt.icon size={16} />
                                    <span className="text-xs font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="flex items-end justify-between border-t border-white/10 pt-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">Est. Annual Footprint</span>
                    <div className="text-3xl font-black tracking-tighter">
                        {calculateTotal()} <span className="text-sm font-medium text-white/40">Tons</span>
                    </div>
                </div>
                <button
                    onClick={handleAudit}
                    disabled={loading}
                    className="bg-accent hover:bg-accent/80 text-background px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {loading ? <Cpu className="animate-spin" size={16} /> : <Terminal size={16} />}
                    {loading ? 'Auditing...' : 'Audit Me'}
                </button>
            </div>

            {/* AI Results */}
            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-black/40 rounded-xl p-4 border border-accent/30 font-mono text-xs relative overflow-hidden"
                    >
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent animate-scan" />
                        <div className="flex flex-col gap-2">
                            <span className="text-accent font-bold uppercase tracking-widest mb-1">&gt;&gt; SYSTEM VERDICT:</span>
                            <p className="text-white/80 leading-relaxed mb-2">
                                {analysis.verdict}
                            </p>
                            <div className="space-y-1">
                                {analysis.swaps && analysis.swaps.map((swap, i) => (
                                    <div key={i} className="flex items-start gap-2 text-white/60">
                                        <span className="text-accent">&gt;</span>
                                        {swap}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CarbonFootprint;
