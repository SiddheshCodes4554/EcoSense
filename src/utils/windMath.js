/**
 * Utility for wind and pollution path calculations
 */

/**
 * Calculates a triangle/cone polygon pointing into the wind
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} windDeg - Wind direction in degrees (0-360)
 * @param {number} distanceKm - Length of the cone in km
 * @returns {Array} List of [lat, lng] coordinates
 */
export const calculateWindPolygon = (lat, lng, windDeg, distanceKm = 2) => {
    // Convert to radians and flip (windDeg is where wind comes FROM, we want to point INTO the wind or AWAY for dispersion?)
    // User says: "If wind is blowing from 90 (East), the pollution source is to the East."
    // So the cone should point TOWARDS 90 deg.
    const centerRad = (windDeg * Math.PI) / 180;
    const spread = (15 * Math.PI) / 180; // 15 degree spread on each side

    const getPoint = (angle, dist) => {
        const dR = dist / 6371; // Earth radius in km
        const lat1 = (lat * Math.PI) / 180;
        const lon1 = (lng * Math.PI) / 180;

        const lat2 = Math.asin(
            Math.sin(lat1) * Math.cos(dR) +
            Math.cos(lat1) * Math.sin(dR) * Math.cos(angle)
        );
        const lon2 =
            lon1 +
            Math.atan2(
                Math.sin(angle) * Math.sin(dR) * Math.cos(lat1),
                Math.cos(dR) - Math.sin(lat1) * Math.sin(lat2)
            );

        return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
    };

    const p1 = getPoint(centerRad - spread, distanceKm);
    const p2 = getPoint(centerRad + spread, distanceKm);

    return [[lat, lng], p1, p2];
};

/**
 * Converts degrees to cardinal direction
 */
export const getCardinalDirection = (deg) => {
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
};
