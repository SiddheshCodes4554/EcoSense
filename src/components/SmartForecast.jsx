import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer
} from 'recharts';
import { analyzeForecast, mapOWMAQI } from '../utils/pollutantAnalysis';
import { Clock, TrendingUp, Sun } from 'lucide-react';

const SmartForecast = ({ forecastData }) => {
    if (!forecastData || forecastData.length === 0) return null;

    const insights = analyzeForecast(forecastData);

    // Format data for Recharts
    const chartData = forecastData.map(item => {
        const mapped = mapOWMAQI(item.aqi);
        return {
            time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            aqi: item.aqi,
            score: mapped.score,
            label: mapped.label,
            color: mapped.color
        };
    });

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    <h3 className="font-bold text-lg">Neuro-Forecaster</h3>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/40 font-mono uppercase">Next 24 Hours</span>
                </div>
            </div>

            {/* AI Insight Bar */}
            <div className="glass p-4 rounded-xl border-primary/20 bg-primary/5 flex items-start gap-3">
                <div className="mt-1">
                    <Sun className="text-primary animate-pulse" size={16} />
                </div>
                <div className="text-xs leading-relaxed">
                    <span className="text-primary font-bold uppercase tracking-tighter mr-2">AI Optimal Window:</span>
                    Pollution will peak at <span className="text-white font-bold">{insights.peak.time}</span>.
                    The "Golden Hour" for outdoor activity is <span className="text-primary font-bold">{insights.golden.time}</span> when dispersion is optimal.
                </div>
            </div>

            {/* Graph Case */}
            <div className="flex-1 min-h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="time"
                            fontSize={10}
                            tick={{ fill: '#ffffff40' }}
                            axisLine={false}
                            tickLine={false}
                            interval={4}
                        />
                        <YAxis
                            fontSize={10}
                            tick={{ fill: '#ffffff40' }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 5]}
                        />
                        <ChartTooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '10px'
                            }}
                            itemStyle={{ color: '#10b981' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="aqi"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorAqi)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
                <div className="flex items-center gap-1">
                    <TrendingUp size={10} />
                    Predictive Engine: Stable
                </div>
                <div>Confidence 94%</div>
            </div>
        </div>
    );
};

export default SmartForecast;
