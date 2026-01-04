import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, MapPin, LocateFixed, Loader2, History, AlertTriangle } from 'lucide-react';
import { useLocationStore } from '../store/useLocationStore';
import { AnimatePresence, motion } from 'framer-motion';

export const LocationSearch = ({ onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const watchId = useRef(null);

    const {
        setCoordinates,
        setLocationName,
        searchHistory,
        addToHistory,
        isTracking,
        setIsTracking
    } = useLocationStore();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLocationUpdate = async (position) => {
        const latitude = parseFloat(position.coords.latitude.toFixed(4));
        const longitude = parseFloat(position.coords.longitude.toFixed(4));

        console.log('GPS Update:', { latitude, longitude });
        if (onLocationSelect) {
            // We'll fetch the name here too for consistency, or let parent do it.
            // But LocationSearch does the reverse geocoding usually.
            // Let's keep the reverse geocoding here.
            try {
                const res = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const name = res.data.display_name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                onLocationSelect({ lat: latitude, lng: longitude, locationName: name });
            } catch (e) {
                console.error('Reverse geocode error', e);
                onLocationSelect({ lat: latitude, lng: longitude, locationName: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` });
            }
            setLoading(false);
            return;
        }

        setCoordinates({ lat: latitude, lng: longitude });
        setErrorMsg('');
        setStatusMsg('');

        try {
            const res = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            setLocationName(res.data.display_name || 'My Location');
        } catch (e) {
            console.error('Reverse geocode error', e);
            // Even if reverse geocoding fails, we have the coordinates, so we don't clear them.
            // Just set a fallback name if needed, but 'My Location' (default in catch usually) or just coordinates is fine.
            if (!useLocationStore.getState().locationName) {
                setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
            }
        }
    };

    const handleLocationError = (error) => {
        console.error('Geolocation error:', error);

        // Error codes: 1 = Permission Denied, 2 = Position Unavailable, 3 = Timeout
        if (error.code === 1) {
            setErrorMsg('Location access denied. Please enable it in browser settings.');
            setIsTracking(false);
        } else if (error.code === 3) {
            // Timeout - try falling back to low accuracy
            setStatusMsg('GPS signal weak, trying alternative method...');
            navigator.geolocation.getCurrentPosition(
                handleLocationUpdate,
                () => {
                    setErrorMsg('Unable to retrieve location even with low accuracy.');
                    setIsTracking(false);
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            );
        } else {
            setErrorMsg('Position unavailable. Try moving to a clearer area.');
            setIsTracking(false);
        }
        setLoading(false);
    };

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds for initial lock
        maximumAge: 30000 // Allow 30s old cache initially to avoid instant failure
    };

    // Live Tracking Effect
    useEffect(() => {
        if (isTracking) {
            if (navigator.geolocation) {
                setLoading(true);
                setStatusMsg('Waiting for precision GPS lock...');
                setErrorMsg('');

                watchId.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        handleLocationUpdate(pos);
                        setLoading(false);
                    },
                    handleLocationError,
                    geoOptions
                );
            } else {
                setErrorMsg('Geolocation is not supported by your browser');
                setIsTracking(false);
            }
        } else {
            if (watchId.current) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            setLoading(false);
            setStatusMsg('');
        }

        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        };
    }, [isTracking]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                try {
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`
                    );
                    setSuggestions(response.data);
                    setShowDropdown(true);
                } catch (error) {
                    console.error('Geocoding error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (s) => {
        const lat = parseFloat(s.lat);
        const lng = parseFloat(s.lon);

        if (onLocationSelect) {
            onLocationSelect({
                lat,
                lng,
                locationName: s.display_name
            });
            // Clear local state but don't close until validated/used by parent
            setQuery('');
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        setIsTracking(false);
        setCoordinates({ lat, lng });
        setLocationName(s.display_name);
        addToHistory(s.display_name);
        setQuery('');
        setSuggestions([]);
        setShowDropdown(false);
        setErrorMsg('');
        setStatusMsg('');
    };

    const toggleLocate = () => {
        setErrorMsg('');
        setStatusMsg('');
        setIsTracking(!isTracking);
    };

    return (
        <div className="relative w-full max-w-md" ref={dropdownRef}>
            <div className="glass flex items-center px-4 py-2 rounded-full border border-white/10 focus-within:border-primary/50 transition-all">
                <Search size={18} className="text-white/40 mr-2" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length === 0) setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search for a city..."
                    className="bg-transparent flex-1 outline-none text-sm text-white placeholder:text-white/20"
                />

                {loading ? (
                    <div className="flex items-center gap-2 ml-2">
                        {isTracking && (
                            <span className="text-[9px] text-white/40 font-mono hidden md:inline animate-pulse">
                                GPS LOCKING...
                            </span>
                        )}
                        <Loader2 size={18} className="text-primary animate-spin" />
                    </div>
                ) : (
                    <button
                        onClick={toggleLocate}
                        className={`p-1 transition-colors ml-2 ${isTracking ? 'text-primary animate-pulse' : 'hover:text-primary text-white/40'}`}
                        title={isTracking ? "Tracking enabled" : "Use current location"}
                    >
                        <LocateFixed size={18} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {(errorMsg || statusMsg) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute top-full mt-2 w-full p-3 glass border rounded-xl text-xs flex items-center gap-2 z-50 ${errorMsg ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-primary/30 bg-primary/10 text-primary'
                            }`}
                    >
                        {errorMsg ? <AlertTriangle size={14} /> : <Loader2 size={14} className="animate-spin" />}
                        {errorMsg || statusMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {showDropdown && !errorMsg && (
                <div className="absolute top-full mt-2 w-full glass rounded-xl border border-white/10 overflow-hidden z-50 shadow-2xl backdrop-blur-xl">
                    {suggestions.length > 0 ? (
                        suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelect(s)}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0"
                            >
                                <MapPin size={14} className="text-primary" />
                                <span className="truncate">{s.display_name}</span>
                            </button>
                        ))
                    ) : query.length === 0 && searchHistory.length > 0 ? (
                        <div className="flex flex-col">
                            <div className="px-4 py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest bg-white/5">Recent</div>
                            {searchHistory.map((h, i) => (
                                <button
                                    key={i}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0"
                                >
                                    <History size={14} className="text-white/20" />
                                    <span className="truncate text-white/60">{h}</span>
                                </button>
                            ))}
                        </div>
                    ) : query.length > 2 && !loading ? (
                        <div className="px-4 py-3 text-sm text-white/40">No locations found</div>
                    ) : null}
                </div>
            )}
        </div>
    );
};
