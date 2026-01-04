/**
 * Analyzes current pollutant mix to identify likely sources.
 * Based on user-provided classification logic.
 */
export const classifySource = (pollutants) => {
    const { pm25, pm10, no2, co, so2 } = pollutants;

    // Extract values
    const p25 = pm25?.value || 0;
    const p10 = pm10?.value || 0;
    const n2 = no2?.value || 0;
    const c = co?.value || 0;
    const s2 = so2?.value || 0;

    // Traffic Signature: If NO2 is High (>50) AND CO is High.
    if (n2 > 50 && c > 1000) { // OWM CO is usually in micrograms/m3, high is > 1000
        return {
            type: "Vehicular Emissions",
            description: "High nitrogen and carbon monoxide levels suggest heavy traffic or exhaust proximity.",
            icon: "Car"
        };
    }

    // Industry Signature: If SO2 is High (>20).
    if (s2 > 20) {
        return {
            type: "Industrial Activity",
            description: "Elevated sulfur dioxide levels typically indicate industrial fuel burning or power plants.",
            icon: "Factory"
        };
    }

    // Dust/Construction Signature: If PM10 is significantly higher than PM2.5 (Ratio PM2.5/PM10 < 0.5)
    if (p10 > 50 && (p25 / p10) < 0.5) {
        return {
            type: "Dust & Construction",
            description: "Large particulates (PM10) dominant. Likely road dust, construction, or wind-blown soil.",
            icon: "HardHat"
        };
    }

    // Crop Burning/Smoke: If PM2.5 is dominant (Ratio > 0.8)
    if (p25 > 25 && (p25 / p10) > 0.8) {
        return {
            type: "Smoke & Combustion",
            description: "Fine particulates (PM2.5) dominant. Likely biomass burning, smoke, or residential heating.",
            icon: "Flame"
        };
    }

    return {
        type: "Background Dispersion",
        description: "Pollutant levels are balanced. No single dominant pollution source detected.",
        icon: "Wind"
    };
};

/**
 * Finds the Peak Hazard and Golden Hour from forecast data.
 */
export const analyzeForecast = (forecastList) => {
    if (!forecastList || forecastList.length === 0) return null;

    let peak = forecastList[0];
    let golden = forecastList[0];

    forecastList.forEach(item => {
        if (item.aqi > peak.aqi) peak = item;
        if (item.aqi < golden.aqi) golden = item;
    });

    return {
        peak: {
            time: new Date(peak.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            aqi: peak.aqi
        },
        golden: {
            time: new Date(golden.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            aqi: golden.aqi
        }
    };
};

/**
 * Converts OWM AQI (1-5) to a comparable 0-500 scale for UI consistency if needed, 
 * or just maps it to colors. Note: OWM 1=Good, 5=Very Poor.
 */
export const mapOWMAQI = (aqi) => {
    const map = {
        1: { label: 'Good', score: 20, color: '#10b981' },
        2: { label: 'Fair', score: 70, color: '#f59e0b' },
        3: { label: 'Moderate', score: 120, color: '#f97316' },
        4: { label: 'Poor', score: 180, color: '#ef4444' },
        5: { label: 'Very Poor', score: 250, color: '#7e22ce' },
    };
    return map[aqi] || map[1];
};
