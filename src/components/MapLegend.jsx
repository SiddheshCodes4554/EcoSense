import React from 'react';

const MapLegend = () => {
    return (
        <div className="absolute bottom-4 left-4 z-[1000] glass p-3 rounded-lg border border-white/10 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Global Air Quality</span>
            <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-gradient-to-r from-[#10b981] via-[#f59e0b] via-[#ef4444] to-[#7e22ce]" />
            </div>
            <div className="flex justify-between w-32 text-[9px] font-bold text-white/40">
                <span>0</span>
                <span>50</span>
                <span>100</span>
                <span>200</span>
                <span>300+</span>
            </div>
        </div>
    );
};

export default MapLegend;
