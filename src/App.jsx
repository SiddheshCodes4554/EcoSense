import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAirQuality } from './hooks/useAirQuality';
import { useLocationStore } from './store/useLocationStore';
import { getCardinalDirection } from './utils/windMath';
import { LocationSearch } from './components/LocationSearch';
import AirQualityMap from './components/AirQualityMap';
import SmartForecast from './components/SmartForecast';
import { classifySource } from './utils/pollutantAnalysis';
import ImpactSection from './components/ImpactSection';
import ExposureCalculator from './components/tools/ExposureCalculator';
import BreathingCoach from './components/tools/BreathingCoach';
import CarbonFootprint from './components/tools/CarbonFootprint';
import SolarEfficiency from './components/solar/SolarEfficiency';
import WelcomeScreen from './components/WelcomeScreen';
import {
  Wind,
  Home,
  Trees,
  Activity,
  AlertTriangle,
  Info,
  ShieldCheck,
  Zap,
  Navigation,
  Loader2,
  Car,
  Factory,
  HardHat,
  Flame,
  Search
} from 'lucide-react';


const Card = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`glass glass-hover p-6 rounded-lg ${className}`}
  >
    {children}
  </motion.div>
);

const AQIGauge = ({ aqi }) => {
  const getColor = (val) => {
    if (val <= 50) return '#10b981'; // Green
    if (val <= 100) return '#f59e0b'; // Yellow (Moderate)
    if (val <= 150) return '#f97316'; // Orange (Sensitive)
    if (val <= 200) return '#ef4444'; // Red (Unhealthy)
    if (val <= 300) return '#7e22ce'; // Purple (Very Unhealthy)
    return '#4c0519'; // Maroon (Hazardous)
  };

  const percentage = Math.min(100, (aqi / 500) * 100);
  const color = getColor(aqi);

  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="80"
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="96"
          cy="96"
          r="80"
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={502.4}
          initial={{ strokeDashoffset: 502.4 }}
          animate={{ strokeDashoffset: 502.4 - (502.4 * percentage) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={aqi}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-bold tracking-tighter"
        >
          {Math.floor(aqi)}
        </motion.span>
        <span className="text-sm font-medium opacity-60 uppercase tracking-widest">AQI Score</span>
      </div>
    </div>
  );
};

const App = () => {
  const { data, isIndoor, toggleIndoor, error } = useAirQuality();
  const { locationName, isTracking, coordinates } = useLocationStore();

  if (!coordinates) return <WelcomeScreen />;

  if (!data) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <AlertTriangle className="text-red-500" size={48} />
            <p className="text-red-400 font-mono text-center px-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <Loader2 className="text-primary animate-spin" size={48} />
            <p className="text-white/40 font-mono animate-pulse">Synchronizing with Eco-Sensors...</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8 font-sans transition-colors duration-700">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Wind className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">EcoSense<span className="text-primary not-italic">AI</span></h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-[0.2em]">Real-time Atmospheric Intelligence</span>
              {isTracking && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-bold text-primary animate-pulse uppercase">
                  <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_#10b981]" />
                  Live GPS Tracking
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col items-end mr-4 hidden md:flex">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Current Zone</span>
            <span className="text-sm font-medium text-white/80 max-w-[200px] truncate">{locationName}</span>
          </div>
          <LocationSearch />
          <button
            onClick={toggleIndoor}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isIndoor ? 'bg-primary/20 border-primary/50 text-white' : 'glass text-white/60'
              }`}
          >
            {isIndoor ? <Home size={18} /> : <Trees size={18} />}
            <span className="text-sm font-medium">{isIndoor ? 'Indoor View' : 'Outdoor View'}</span>
          </button>

          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-mono text-white/60 uppercase">{data.timestamp}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto bento-grid">
        {/* Main AQI Gauge Case */}
        <Card className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 flex flex-col items-center justify-center !p-10 border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <Zap className="text-primary/20" size={120} />
          </div>
          <div className="flex flex-col items-center text-center mb-4">
            <div className="flex items-center gap-2 text-white/40 mb-1">
              <Navigation size={12} />
              <span className="text-[10px] font-mono uppercase tracking-widest">{locationName.split(',')[0]}</span>
            </div>
          </div>
          <AQIGauge aqi={data.aqi} />
          <div className={`mt-8 px-6 py-2 rounded-full border border-white/10 ${data.advice.color} bg-white/5 font-bold uppercase tracking-widest text-sm`}>
            {data.advice.status}
          </div>
          <div className="mt-4 text-[10px] font-mono text-white/20 uppercase tracking-[4px]">
            Data Source: {data.sourceName}
          </div>
        </Card>

        {/* Neuro-Forecaster Graph */}
        <Card className="col-span-1 md:col-span-2 row-span-2 border-primary/10">
          <SmartForecast forecastData={data.forecast || []} />
        </Card>

        {/* Health Advice Case */}
        <Card className="col-span-1 md:col-span-2 flex flex-col justify-center border-secondary/20 bg-secondary/5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-secondary" />
            <h3 className="font-bold text-lg">Health Recommendation</h3>
          </div>
          <p className="text-white/80 leading-relaxed text-lg">
            {isIndoor ? "Run your air purifier on auto mode. Keep windows closed." : data.advice.advice}
          </p>
        </Card>

        {/* Pollutant Case */}
        <Card className="col-span-1 md:col-span-2 row-span-2 border-accent/20">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-accent" />
            <h3 className="font-bold text-lg">Pollutant Breakdown</h3>
          </div>
          <div className="space-y-6">
            {Object.entries(data.pollutants).map(([key, p], idx) => (
              <div key={key}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-white/60 uppercase">{p.name} {key === 'co' ? '(µ/m³)' : '(ppb)'}</span>
                  <span className="font-mono font-bold">{p.value}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (p.value / p.max) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.1 * idx }}
                    className={`h-full bg-gradient-to-r ${key === 'pm25' ? 'from-red-500/50 to-red-500' :
                      key === 'pm10' ? 'from-orange-500/50 to-orange-500' :
                        'from-accent/50 to-accent'
                      }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pollutant Source Fingerprint */}
        {(() => {
          const fingerprint = classifySource(data.pollutants);
          const Icon = { Car, Factory, HardHat, Flame, Wind }[fingerprint.icon];
          return (
            <Card className="col-span-1 md:col-span-2 bg-white/5 border-white/10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest text-white/40">Chemical Fingerprint</h3>
                  <div className="text-primary font-bold">{fingerprint.type}</div>
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed italic">
                "{fingerprint.description}"
              </p>
            </Card>
          );
        })()}

        {/* Map Placeholder Case */}
        <Card className="col-span-1 md:col-span-2 row-span-2 border-white/5 bg-white/5 !p-0 overflow-hidden group">
          <AirQualityMap aqi={data.aqi} wind={data.wind} />
        </Card>

        {/* AI Analysis Insight Panel (Wind focused) */}
        <Card className="col-span-1 md:col-span-2 border-primary/10 bg-primary/5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <Wind className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
              Atmospheric Analysis
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Live</span>
            </h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Wind from the <span className="text-primary font-bold">{getCardinalDirection(data.wind.deg)}</span> at <span className="text-primary font-bold">{data.wind.speed} m/s</span>.
            </p>
          </div>
        </Card>

        {/* Health Tools Section */}
        <div className="col-span-1 md:col-span-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1 border-primary/20 bg-primary/5">
            <ExposureCalculator pm25={data.pollutants.pm25.value} />
          </Card>
          <Card className="col-span-1 border-secondary/20 bg-secondary/5">
            <BreathingCoach aqi={data.aqi} />
          </Card>
          <Card className="col-span-1 border-accent/20 bg-accent/5">
            <CarbonFootprint />
          </Card>
          <Card className="col-span-1 border-amber-500/20 bg-amber-500/5">
            <SolarEfficiency
              weather={data.weather}
              pm25={data.pollutants.pm25}
            />
          </Card>
        </div>

        {/* Impact Lab Section */}
        <div className="col-span-1 md:col-span-4 mt-6">
          <ImpactSection aqi={data.aqi} pollutants={data.pollutants} />
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="max-w-7xl mx-auto mt-12 flex flex-col md:flex-row justify-between items-center text-white/40 text-[10px] gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-mono uppercase">AI CORE: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 tracking-widest">
            <span className="font-mono uppercase opacity-50 italic">Aggregated from {data.sourceName}</span>
          </div>
        </div>
        <div className="font-mono">
          &copy; 2026 ECOSENSE • EPA COMPLIANT DATA ENGINE
        </div>
      </footer>
    </div>
  );
};

export default App;
