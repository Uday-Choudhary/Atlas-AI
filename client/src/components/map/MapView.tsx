import { useEffect, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapViewProps {
    itinerary?: any;
    selectedDay?: number;
    className?: string;
    focusCoord?: { lat: number; lng: number; label: string } | null;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

const DAY_COLORS = [
    "#6C3CE0", "#E04C3C", "#3CB371", "#FF8C00", "#4169E1",
    "#FF1493", "#00CED1", "#FF6347", "#8A2BE2", "#20B2AA",
];

const MapView = ({ itinerary, selectedDay, className = "", focusCoord }: MapViewProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    const coordinates = useMemo(() => {
        if (!itinerary?.trip_plan?.itinerary) return [];

        const days = itinerary.trip_plan.itinerary;
        const allCoords: Array<{
            lat: number;
            lng: number;
            name: string;
            day: number;
            type: string;
        }> = [];

        // Add hotel markers
        (itinerary.trip_plan.hotels || []).forEach((hotel: any) => {
            if (hotel.geo_coordinates?.latitude && hotel.geo_coordinates?.longitude) {
                allCoords.push({
                    lat: hotel.geo_coordinates.latitude,
                    lng: hotel.geo_coordinates.longitude,
                    name: hotel.hotel_name,
                    day: 0,
                    type: "hotel",
                });
            }
        });

        // Add activity markers
        days.forEach((day: any) => {
            (day.activities || []).forEach((activity: any) => {
                if (activity.geo_coordinates?.latitude && activity.geo_coordinates?.longitude) {
                    allCoords.push({
                        lat: activity.geo_coordinates.latitude,
                        lng: activity.geo_coordinates.longitude,
                        name: activity.place_name,
                        day: day.day,
                        type: "activity",
                    });
                }
            });
        });

        return allCoords;
    }, [itinerary]);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        if (!MAPBOX_TOKEN) {
            // Render placeholder when no token
            if (mapContainer.current) {
                mapContainer.current.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px;flex-direction:column;gap:12px;">
                        <div style="font-size:48px;">🗺️</div>
                        <p style="color:#8b8fa3;font-size:14px;text-align:center;padding:0 20px;">Add VITE_MAPBOX_TOKEN to enable interactive 3D maps</p>
                    </div>`;
            }
            return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [-0.1276, 51.5072],
            zoom: 12,
            pitch: 45,
            bearing: -17.6,
            antialias: true,
        });

        // Add ResizeObserver to fix the "too much white space" bug 
        // when the map container expands into fullscreen mode
        const resizeObserver = new ResizeObserver(() => {
            map.current?.resize();
        });
        resizeObserver.observe(mapContainer.current);

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("style.load", () => {
            // Add 3D buildings
            const layers = map.current?.getStyle()?.layers;
            if (!layers) return;

            let labelLayerId;
            for (let i = 0; i < layers.length; i++) {
                // Ignore TypeScript error for layout properties
                // @ts-ignore
                if (layers[i].type === "symbol" && layers[i].layout && layers[i].layout["text-field"]) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }

            map.current?.addLayer(
                {
                    id: "3d-buildings",
                    source: "composite",
                    "source-layer": "building",
                    filter: ["==", "extrude", "true"],
                    type: "fill-extrusion",
                    minzoom: 15,
                    paint: {
                        "fill-extrusion-color": "#e0e0e0",
                        "fill-extrusion-height": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            15,
                            0,
                            15.05,
                            ["get", "height"],
                        ],
                        "fill-extrusion-base": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            15,
                            0,
                            15.05,
                            ["get", "min_height"],
                        ],
                        "fill-extrusion-opacity": 0.8,
                    },
                },
                labelLayerId
            );
        });

        return () => {
            resizeObserver.disconnect();
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Fly to a specific coord when "View on Map" is clicked
    useEffect(() => {
        if (!focusCoord || !map.current || !MAPBOX_TOKEN) return;

        const flyToLocation = () => {
            if (!map.current) return;
            map.current.flyTo({
                center: [focusCoord.lng, focusCoord.lat],
                zoom: 15,
                duration: 1800,
                essential: true,
            });
            // Show a popup at the focused location
            new mapboxgl.Popup({ closeOnClick: true, offset: 12 })
                .setLngLat([focusCoord.lng, focusCoord.lat])
                .setHTML(`
                    <div style="padding:6px 8px;font-family:inherit;">
                        <strong style="font-size:13px;">${focusCoord.label}</strong>
                    </div>`)
                .addTo(map.current);
        };

        if (map.current.isStyleLoaded()) {
            flyToLocation();
        } else {
            map.current.once("style.load", flyToLocation);
        }
    }, [focusCoord]);

    // Update markers when coordinates or selectedDay changes
    useEffect(() => {
        if (!map.current || !MAPBOX_TOKEN) return;

        const updateMap = () => {
            if (!map.current) return;

            // Guard: do nothing if style isn't loaded yet
            if (!map.current.isStyleLoaded()) return;

            // Clear old markers
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];

            // Remove old route sources/layers safely
            try {
                const style = map.current.getStyle();
                if (style?.layers) {
                    style.layers.forEach((layer) => {
                        if (layer.id.startsWith("route-")) {
                            map.current?.removeLayer(layer.id);
                        }
                    });
                }
                if (style?.sources) {
                    Object.keys(style.sources).forEach((sourceId) => {
                        if (sourceId.startsWith("route-")) {
                            map.current?.removeSource(sourceId);
                        }
                    });
                }
            } catch {
                // Style not ready — skip cleanup this cycle
                return;
            }

            const filteredCoords = selectedDay
                ? coordinates.filter((c) => c.day === selectedDay || c.type === "hotel")
                : coordinates;

            if (filteredCoords.length === 0) return;

            // Add markers
            filteredCoords.forEach((coord) => {
                const color =
                    coord.type === "hotel"
                        ? "#FFD700"
                        : DAY_COLORS[(coord.day - 1) % DAY_COLORS.length];

                const el = document.createElement("div");
                el.style.cssText = `
                    width: ${coord.type === "hotel" ? "32px" : "24px"};
                    height: ${coord.type === "hotel" ? "32px" : "24px"};
                    background: ${color};
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                `;
                el.innerHTML = coord.type === "hotel" ? "🏨" : `<span style="color:white;font-weight:bold;font-size:10px">${coord.day}</span>`;

                const popup = new mapboxgl.Popup({ offset: 15, closeButton: false })
                    .setHTML(`
                        <div style="padding:8px;font-family:inherit;">
                            <strong style="font-size:13px;">${coord.name}</strong>
                            <br><span style="font-size:11px;color:#666;">${coord.type === "hotel" ? "🏨 Hotel" : `📅 Day ${coord.day}`}</span>
                        </div>`);

                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat([coord.lng, coord.lat])
                    .setPopup(popup)
                    .addTo(map.current!);

                markersRef.current.push(marker);
            });

            // Draw route lines per day
            const days = itinerary?.trip_plan?.itinerary || [];
            days.forEach((day: any) => {
                if (selectedDay && day.day !== selectedDay) return;

                const dayCoords = (day.activities || [])
                    .filter((a: any) => a.geo_coordinates?.latitude && a.geo_coordinates?.longitude)
                    .map((a: any) => [a.geo_coordinates.longitude, a.geo_coordinates.latitude]);

                if (dayCoords.length < 2) return;

                const sourceId = `route-day-${day.day}`;
                const layerId = `route-day-${day.day}`;
                const color = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];

                if (!map.current?.getSource(sourceId)) {
                    map.current?.addSource(sourceId, {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            properties: {},
                            geometry: { type: "LineString", coordinates: dayCoords },
                        },
                    });

                    map.current?.addLayer({
                        id: layerId,
                        type: "line",
                        source: sourceId,
                        layout: { "line-join": "round", "line-cap": "round" },
                        paint: {
                            "line-color": color,
                            "line-width": 3,
                            "line-opacity": 0.8,
                            "line-dasharray": [2, 1],
                        },
                    });
                }
            });

            // Fly to fit bounds
            if (filteredCoords.length > 0) {
                const bounds = new mapboxgl.LngLatBounds();
                filteredCoords.forEach((c) => bounds.extend([c.lng, c.lat]));
                map.current.fitBounds(bounds, {
                    padding: 60,
                    maxZoom: 12,
                    duration: 2000,
                });
            }
        };

        // Run immediately if style is ready, otherwise defer until style.load
        if (map.current.isStyleLoaded()) {
            updateMap();
        } else {
            map.current.once("style.load", updateMap);
        }
    }, [coordinates, selectedDay, itinerary]);

    return (
        <div
            ref={mapContainer}
            className={`w-full h-full rounded-2xl overflow-hidden ${className}`}
            style={{ minHeight: "300px" }}
        />
    );
};

export default MapView;
