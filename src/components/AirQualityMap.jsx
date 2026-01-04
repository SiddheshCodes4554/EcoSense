import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, useMap, Polygon, Tooltip, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationStore } from '../store/useLocationStore';
import { calculateWindPolygon, getCardinalDirection } from '../utils/windMath';
import MapLegend from './MapLegend';

const WAQI_TOKEN = import.meta.env.VITE_WAQI_API_KEY;

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords.lat && coords.lng) {
            map.flyTo([coords.lat, coords.lng], 13, {
                animate: true,
                duration: 1.5
            });
        }
    }, [coords.lat, coords.lng, map]);
    return null;
};

const AirQualityMap = ({ aqi, wind }) => {
    const { coordinates } = useLocationStore();

    const getAQIColor = (val) => {
        if (val <= 50) return '#10b981'; // Green
        if (val <= 100) return '#f59e0b'; // Yellow (Moderate)
        if (val <= 150) return '#f97316'; // Orange (Sensitive)
        if (val <= 200) return '#ef4444'; // Red (Unhealthy)
        if (val <= 300) return '#7e22ce'; // Purple (Very Unhealthy)
        return '#4c0519'; // Maroon (Hazardous)
    };

    const center = [coordinates.lat, coordinates.lng];
    const color = getAQIColor(aqi);

    // Calculate Wind Path Polygon
    const windCone = wind ? calculateWindPolygon(coordinates.lat, coordinates.lng, wind.deg, 2) : [];
    const cardinal = wind ? getCardinalDirection(wind.deg) : '';

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                zoomControl={false}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Dark Map">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.Overlay checked name="AQI Heatmap">
                        <TileLayer
                            url={`https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${WAQI_TOKEN}`}
                            attribution='&copy; <a href="https://waqi.info">WAQI</a>'
                        />
                    </LayersControl.Overlay>
                </LayersControl>

                {/* AQI Range Circle */}
                <Circle
                    center={center}
                    radius={2000}
                    pathOptions={{
                        fillColor: color,
                        fillOpacity: 0.1,
                        color: color,
                        weight: 1,
                        dashArray: '5, 10'
                    }}
                />

                {/* Pollution Path (Wind Cone) */}
                {windCone.length > 0 && (
                    <Polygon
                        positions={windCone}
                        pathOptions={{
                            fillColor: aqi > 150 ? '#ef4444' : '#f59e0b',
                            fillOpacity: 0.3,
                            color: aqi > 150 ? '#ef4444' : '#f59e0b',
                            weight: 0,
                            className: 'animate-pulse'
                        }}
                    >
                        <Tooltip permanent={false} direction="top">
                            <div className="font-mono text-[10px] uppercase text-white bg-background/80 p-2 rounded">
                                Pollution carrying from {cardinal} at {wind.speed} km/h
                            </div>
                        </Tooltip>
                    </Polygon>
                )}

                {/* Pulsing Marker */}
                <Circle
                    center={center}
                    radius={150}
                    pathOptions={{
                        fillColor: color,
                        fillOpacity: 0.8,
                        color: '#fff',
                        weight: 2,
                        className: 'marker-pulse'
                    }}
                />

                <MapController coords={coordinates} />
            </MapContainer>

            <MapLegend />

            {/* Map Labels / UI Overlay */}
            <div className="absolute bottom-4 right-4 z-[1000] glass px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Hyperlocal Zone: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </span>
            </div>
        </div>
    );
};

export default AirQualityMap;
