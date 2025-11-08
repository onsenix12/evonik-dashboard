/**
 * Map Utilities for Production Flow Map
 * Breaks down large map initialization into smaller, focused functions
 */

// Map configuration constants
const MAP_CONFIG = {
    INITIAL_VIEW: { lat: 20, lon: 0, zoom: 2 },
    CURVE_INTENSITY: 8,
    FLOW_POINTS: 50,
    MAP_INVALIDATE_DELAY: 100,
    MAP_RETRY_DELAY: 500
};

// Plant locations data
const PLANT_LOCATIONS = {
    'Singapore': { 
        name: 'Jurong Island (ME5/ME6)',
        city: 'Singapore',
        lat: 1.3009, 
        lon: 103.7876
    },
    'Belgium': { 
        name: 'Antwerp Plant',
        city: 'Antwerp',
        lat: 51.2600, 
        lon: 4.4020
    },
    'United States': { 
        name: 'Mobile Plant',
        city: 'Mobile, Alabama',
        lat: 30.6954, 
        lon: -88.0399
    }
};

// Regional destination points
const REGION_LOCATIONS = {
    'APAC': { lat: 20, lon: 110 },
    'Europe': { lat: 50, lon: 10 },
    'Americas': { lat: 30, lon: -90 }
};

// Shipment flows configuration
const SHIPMENT_FLOWS = [
    { 
        from: 'Singapore', 
        to: 'APAC', 
        volume: 'high', 
        mt: 28950, 
        color: '#8B2E8B',
        status: 'in-transit'
    },
    { 
        from: 'Singapore', 
        to: 'Europe', 
        volume: 'medium', 
        mt: 4200, 
        color: '#A855F7',
        status: 'in-transit'
    },
    { 
        from: 'Singapore', 
        to: 'Americas', 
        volume: 'low', 
        mt: 1800, 
        color: '#C084FC',
        status: 'scheduled'
    },
    { 
        from: 'Belgium', 
        to: 'Europe', 
        volume: 'high', 
        mt: 15600, 
        color: '#8B2E8B',
        status: 'in-transit'
    },
    { 
        from: 'United States', 
        to: 'Americas', 
        volume: 'high', 
        mt: 13500, 
        color: '#8B2E8B',
        status: 'in-transit'
    }
];

/**
 * Create map instance
 * @param {string} containerId - ID of map container element
 * @returns {L.Map|null} - Leaflet map instance or null
 */
function createMapInstance(containerId) {
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return null;
    }

    try {
        const map = L.map(containerId, { 
            zoomControl: true, 
            worldCopyJump: true,
            preferCanvas: true
        }).setView(
            [MAP_CONFIG.INITIAL_VIEW.lat, MAP_CONFIG.INITIAL_VIEW.lon], 
            MAP_CONFIG.INITIAL_VIEW.zoom
        );
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 8,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        // Force map to invalidate size after a short delay
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, MAP_CONFIG.MAP_INVALIDATE_DELAY);
        
        return map;
    } catch (error) {
        console.error('Error creating map instance:', error);
        return null;
    }
}

/**
 * Generate curved path points for flow line
 * @param {Object} from - Start coordinates {lat, lon}
 * @param {Object} to - End coordinates {lat, lon}
 * @returns {Array} - Array of [lat, lon] points
 */
function generateCurvedPath(from, to) {
    const midLat = (from.lat + to.lat) / 2;
    const midLon = (from.lon + to.lon) / 2;
    const controlLat = midLat + MAP_CONFIG.CURVE_INTENSITY;
    const controlLon = midLon;
    
    const points = [];
    for (let i = 0; i <= MAP_CONFIG.FLOW_POINTS; i++) {
        const t = i / MAP_CONFIG.FLOW_POINTS;
        const lat = (1-t)*(1-t)*from.lat + 2*(1-t)*t*controlLat + t*t*to.lat;
        const lon = (1-t)*(1-t)*from.lon + 2*(1-t)*t*controlLon + t*t*to.lon;
        points.push([lat, lon]);
    }
    
    return points;
}

/**
 * Get line width based on volume
 * @param {string} volume - Volume level: 'high', 'medium', 'low'
 * @returns {number} - Line width in pixels
 */
function getLineWidth(volume) {
    const widthMap = {
        'high': 6,
        'medium': 4,
        'low': 2
    };
    return widthMap[volume] || 2;
}

/**
 * Create animated flow line on map
 * @param {L.Map} map - Leaflet map instance
 * @param {Object} from - Start coordinates {lat, lon}
 * @param {Object} to - End coordinates {lat, lon}
 * @param {string} volume - Volume level
 * @param {string} color - Line color
 * @param {number} mt - Volume in metric tons
 * @returns {L.Polyline} - Created polyline
 */
function createFlowLine(map, from, to, volume, color, mt) {
    const points = generateCurvedPath(from, to);
    const lineWidth = getLineWidth(volume);
    
    const polyline = L.polyline(points, {
        color: color,
        weight: lineWidth,
        opacity: 0.8,
        dashArray: '15, 10',
        className: `flow-line ${volume}-volume`
    }).addTo(map);
    
    // Add volume label at midpoint
    const midPoint = points[Math.floor(points.length / 2)];
    L.marker(midPoint, {
        icon: L.divIcon({
            className: 'flow-label',
            html: `<div class="flow-label-badge">${mt.toLocaleString()} MT</div>`,
            iconSize: [null, null],
            iconAnchor: [0, 0]
        })
    }).addTo(map);
    
    return polyline;
}

/**
 * Add plant markers to map
 * @param {L.Map} map - Leaflet map instance
 * @returns {Array} - Array of marker instances
 */
function addPlantMarkers(map) {
    const markers = [];
    
    Object.entries(PLANT_LOCATIONS).forEach(([country, plant]) => {
        const marker = L.circleMarker([plant.lat, plant.lon], {
            radius: 12,
            color: '#FFFFFF',
            weight: 3,
            fillColor: '#8B2E8B',
            fillOpacity: 0.95,
            className: 'plant-marker'
        }).addTo(map);
        
        marker.bindPopup(`
            <div style="min-width: 200px;">
                <strong>${plant.name}</strong><br/>
                📍 ${plant.city}, ${country}
            </div>
        `);
        
        marker.bindTooltip(plant.name, { permanent: false, direction: 'top' });
        markers.push(marker);
    });
    
    return markers;
}

/**
 * Add shipment flow lines to map
 * @param {L.Map} map - Leaflet map instance
 */
function addShipmentFlows(map) {
    SHIPMENT_FLOWS.forEach(flow => {
        const plant = PLANT_LOCATIONS[flow.from];
        const region = REGION_LOCATIONS[flow.to];
        
        if (plant && region) {
            createFlowLine(
                map,
                { lat: plant.lat, lon: plant.lon },
                { lat: region.lat, lon: region.lon },
                flow.volume,
                flow.color,
                flow.mt
            );
        }
    });
}

/**
 * Add region labels to map
 * @param {L.Map} map - Leaflet map instance
 */
function addRegionLabels(map) {
    Object.entries(REGION_LOCATIONS).forEach(([regionName, coords]) => {
        L.marker([coords.lat, coords.lon], {
            icon: L.divIcon({
                className: 'region-label',
                html: `<div style="background: rgba(139, 46, 139, 0.9); color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">${regionName}</div>`,
                iconSize: [null, null],
                iconAnchor: [0, 0]
            })
        }).addTo(map);
    });
}

/**
 * Fit map bounds to show all markers and regions
 * @param {L.Map} map - Leaflet map instance
 * @param {Array} markers - Array of marker instances
 */
function fitMapBounds(map, markers) {
    if (!map || markers.length === 0) return;
    
    const bounds = L.latLngBounds(markers.map(m => m.getLatLng()));
    Object.values(REGION_LOCATIONS).forEach(region => {
        bounds.extend([region.lat, region.lon]);
    });
    map.fitBounds(bounds.pad(0.2));
}

/**
 * Initialize production flow map
 * @param {string} containerId - ID of map container element
 * @param {Function} onError - Error callback
 */
function initializeProductionFlowMap(containerId, onError) {
    const mapEl = document.getElementById(containerId);
    if (!mapEl) {
        if (onError) onError('Map element not found');
        return null;
    }

    // Check if container has dimensions
    if (mapEl.offsetHeight === 0) {
        console.warn('Map container has no height, retrying...');
        setTimeout(() => {
            initializeProductionFlowMap(containerId, onError);
        }, MAP_CONFIG.MAP_RETRY_DELAY);
        return null;
    }

    try {
        const map = createMapInstance(containerId);
        if (!map) {
            if (onError) onError('Failed to create map instance');
            return null;
        }

        const plantMarkers = addPlantMarkers(map);
        addShipmentFlows(map);
        addRegionLabels(map);
        fitMapBounds(map, plantMarkers);

        return map;
    } catch (error) {
        console.error('Error initializing map:', error);
        if (mapEl) {
            mapEl.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">⚠️ Map initialization error. Please check console for details.</div>';
        }
        if (onError) onError(error.message);
        return null;
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeProductionFlowMap,
        createMapInstance,
        addPlantMarkers,
        addShipmentFlows,
        addRegionLabels,
        createFlowLine,
        MAP_CONFIG,
        PLANT_LOCATIONS,
        REGION_LOCATIONS,
        SHIPMENT_FLOWS
    };
}

