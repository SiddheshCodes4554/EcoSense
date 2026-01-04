import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, MapPin, Check, ChevronRight } from 'lucide-react';
import { LocationSearch } from './LocationSearch';
import { useLocationStore } from '../store/useLocationStore';

const WelcomeScreen = () => {
    const [detectedLocation, setDetectedLocation] = useState(null);
    const { setCoordinates, setLocationName } = useLocationStore();

    const handleLocationSelect = (loc) => {
        setDetectedLocation(loc);
    };

    const handleConfirm = () => {
        if (detectedLocation) {
            setCoordinates({ lat: detectedLocation.lat, lng: detectedLocation.lng });
            setLocationName(detectedLocation.locationName);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 flex flex-col items-center max-w-lg w-full text-center space-y-8"
            >
                <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center border border-primary/30 shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-4">
                    <Wind className="text-primary" size={48} />
                </div>

                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-4">
                        EcoSense<span className="text-primary not-italic">AI</span>
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Real-time atmospheric intelligence for your environment.
                        <br />
                        Select a location to begin analysis.
                    </p>
                </div>

                <div className="w-full max-w-sm scale-110 transform origin-top relative z-50">
                    <LocationSearch onLocationSelect={handleLocationSelect} />
                </div>

                <AnimatePresence>
                    {detectedLocation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="w-full max-w-sm"
                        >
                            <div className="glass p-4 rounded-xl border border-primary/30 bg-primary/5 mt-4">
                                <div className="flex items-center gap-3 mb-4 text-left">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                        <MapPin className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Selected Location</div>
                                        <div className="text-white font-medium truncate max-w-[200px]">{detectedLocation.locationName}</div>
                                    </div>
                                    <div className="ml-auto">
                                        <Check className="text-primary" size={24} />
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    className="w-full py-3 bg-primary hover:bg-primary/90 text-background font-bold rounded-lg flex items-center justify-center gap-2 transition-all group"
                                >
                                    <span>Launch EcoSense</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!detectedLocation && (
                    <div className="flex flex-col items-center gap-2 mt-12 opacity-40">
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60">
                            <MapPin size={12} />
                            <span>Global Coverage</span>
                        </div>
                        <div className="w-1 h-8 bg-gradient-to-b from-white/20 to-transparent" />
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
