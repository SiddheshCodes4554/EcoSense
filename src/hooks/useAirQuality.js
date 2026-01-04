import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocationStore } from '../store/useLocationStore';

const WAQI_TOKEN = import.meta.env.VITE_WAQI_API_KEY;
const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const POLLUTANT_CONFIG = {
    pm25: { name: 'PM2.5', unit: 'µg/m³', max: 500 },
    pm10: { name: 'PM10', unit: 'µg/m³', max: 500 },
    no2: { name: 'NO2', unit: 'ppb', max: 200 },
    o3: { name: 'O3', unit: 'ppb', max: 200 },
    so2: { name: 'SO2', unit: 'ppb', max: 200 },
    co: { name: 'CO', unit: 'µg/m³', max: 15000 },
};

const getHealthAdvice = (aqi) => {
    if (aqi > 300) return { status: 'Hazardous', advice: 'Hazardous. Stay indoors. Wear N95 mask if you must go out.', color: 'text-aqi-deadly' };
    if (aqi > 200) return { status: 'Very Unhealthy', advice: 'Very Unhealthy. Avoid all outdoor physical activity.', color: 'text-aqi-hazardous' };
    if (aqi > 150) return { status: 'Unhealthy', advice: 'Unhealthy. Avoid prolonged outdoor exertion.', color: 'text-aqi-unhealthy' };
    if (aqi > 100) return { status: 'Unhealthy for Sensitive Groups', advice: 'Sensitive groups should close windows and reduce activity.', color: 'text-aqi-moderate' };
    if (aqi > 50) return { status: 'Moderate', advice: 'Air quality is acceptable. Sensitive individuals should monitor.', color: 'text-aqi-moderate' };
    return { status: 'Good', advice: 'Air is clean. Enjoy the outdoors!', color: 'text-primary' };
};

export const useAirQuality = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isIndoor, setIsIndoor] = useState(false);
    const { coordinates } = useLocationStore();

    const fetchSensorFusion = async (coords) => {
        if (!coords) return null;

        if (!WAQI_TOKEN || !OWM_KEY) {
            console.warn('API Tokens missing. Using mock data.');
            return generateMockData(coords);
        }

        try {
            const opts = { timeout: 10000 };
            const lat = Number(coords.lat).toFixed(4);
            const lng = Number(coords.lng).toFixed(4);

            const [waqiRes, owmRes, forecastRes] = await Promise.all([
                axios.get(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_TOKEN}`, opts),
                axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`, opts),
                axios.get(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lng}&appid=${OWM_KEY}`, opts)
            ]);

            if (waqiRes.data.status !== 'ok') throw new Error('WAQI API Error');

            const waqi = waqiRes.data.data;
            const owm = owmRes.data;
            const forecast = forecastRes.data.list.slice(0, 24).map(item => ({
                dt: item.dt,
                aqi: item.main.aqi, // OWM 1-5
                components: item.components
            }));

            const aqiScore = waqi.aqi;
            const advice = getHealthAdvice(aqiScore);
            const attribution = waqi.attributions?.[0]?.name || 'Global Monitoring Network';

            const iaqi = waqi.iaqi || {};
            const pollutants = {
                pm25: { ...POLLUTANT_CONFIG.pm25, value: iaqi.pm25?.v || 0 },
                pm10: { ...POLLUTANT_CONFIG.pm10, value: iaqi.pm10?.v || 0 },
                no2: { ...POLLUTANT_CONFIG.no2, value: iaqi.no2?.v || 0 },
                o3: { ...POLLUTANT_CONFIG.o3, value: iaqi.o3?.v || 0 },
                so2: { ...POLLUTANT_CONFIG.so2, value: iaqi.so2?.v || 0 },
                co: { ...POLLUTANT_CONFIG.co, value: iaqi.co?.v || 0 },
            };

            return {
                aqi: aqiScore,
                pollutants,
                advice,
                sourceName: attribution,
                forecast,
                wind: {
                    speed: owm.wind.speed,
                    deg: owm.wind.deg
                },
                weather: {
                    temp: owm.main.temp,
                    clouds: owm.clouds ? owm.clouds.all : 0,
                    description: owm.weather[0].description
                },
                timestamp: new Date().toLocaleTimeString(),
                location: coords
            };
        } catch (err) {
            console.error('Sensor Fusion error:', err);
            setError('Failed to fetch fused data');
            return generateMockData(coords);
        }
    };

    const generateMockData = (coords) => {
        const hash = (coords.lat + coords.lng).toString();
        let seed = 0;
        for (let i = 0; i < hash.length; i++) seed = ((seed << 5) - seed) + hash.charCodeAt(i);
        const aqi = 100 + Math.abs(seed % 400);
        const advice = getHealthAdvice(aqi);

        // Generate 24h forecast
        const forecast = Array.from({ length: 24 }).map((_, i) => ({
            dt: Math.floor(Date.now() / 1000) + (i * 3600),
            aqi: Math.max(1, Math.min(5, Math.floor(Math.abs(Math.sin(seed + i) * 5) + 1))),
            components: {}
        }));

        return {
            aqi,
            pollutants: {
                pm25: { ...POLLUTANT_CONFIG.pm25, value: Math.floor((aqi / 500) * 150) },
                pm10: { ...POLLUTANT_CONFIG.pm10, value: Math.floor((aqi / 500) * 200) },
                no2: { ...POLLUTANT_CONFIG.no2, value: Math.floor((aqi / 500) * 80) },
                o3: { ...POLLUTANT_CONFIG.o3, value: Math.floor((aqi / 500) * 120) },
                so2: { ...POLLUTANT_CONFIG.so2, value: Math.floor((aqi / 500) * 40) },
                co: { ...POLLUTANT_CONFIG.co, value: Math.floor((aqi / 500) * 1000) },
            },
            advice,
            sourceName: 'Simulated Eco-Network',
            forecast,
            wind: {
                speed: (Math.abs((seed % 20)) / 2).toFixed(1),
                deg: Math.abs(seed % 360)
            },
            weather: {
                temp: 22,
                clouds: Math.abs(seed % 100),
                description: 'Clear Sky'
            },
            timestamp: new Date().toLocaleTimeString(),
            location: coords
        };
    };

    useEffect(() => {
        console.log('useAirQuality effect triggered', { coordinates });
        let interval;
        const load = async () => {
            console.log('Loading data for', coordinates);
            if (!coordinates) {
                console.log('No coordinates, skipping load');
                return;
            }
            try {
                const result = await fetchSensorFusion(coordinates);
                console.log('Fetched result:', result);
                setData(result);
            } catch (e) {
                console.error('Load error', e);
                setError(e.message);
            }
        };

        load();
        interval = setInterval(load, 600000);

        return () => clearInterval(interval);
    }, [coordinates]);

    const toggleIndoor = () => setIsIndoor(!isIndoor);

    return { data, isIndoor, toggleIndoor, error };
};
