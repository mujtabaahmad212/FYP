import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layers, LocateFixed, RefreshCw, MapPin, AlertTriangle } from 'lucide-react';
import { useIncidents } from '../context/IncidentsContext';

// --- Fix Leaflet marker assets in Vite/CRA ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// --- Helper for severity-specific marker icon ---
const getIncidentIcon = (severity) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };
  const color = colors[severity?.toLowerCase()] || colors.medium;

  return L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="40" height="40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// --- Live user location marker ---
const getUserLocationIcon = () => L.divIcon({
  html: `<svg viewBox="0 0 32 32" width="40" height="40" fill="#0866ff" style="filter: drop-shadow(0 1px 2px rgba(0,32,96,0.4));"><circle cx="16" cy="16" r="12" fill="#fff" /><circle cx="16" cy="16" r="8" fill="#60a5fa"/><circle cx="16" cy="16" r="4" fill="#2563eb"/></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
  className: "user-location-icon"
});

const UserLocationMarker = ({ onLocation }) => {
  const [position, setPosition] = useState(null);
  const map = useMap();
  const watcher = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    watcher.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        if (onLocation) onLocation(coords);
      },
      (err) => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 7000 }
    );
    return () => {
      if (watcher.current) navigator.geolocation.clearWatch(watcher.current);
    };
  }, [onLocation]);

  // Optionally always pan to position if user location changes
  useEffect(() => {
    if (position) { map.flyTo(position, 15); }
  }, [position, map]);

  return position ? (
    <Marker position={position} icon={getUserLocationIcon()}>
      <Popup>You Are Here</Popup>
    </Marker>
  ) : null;
};

// --- Map Controls (locate/refresh) ---
const MapControls = ({ onLocate, onRefresh }) => {
  const map = useMap();

  const handleLocate = () => {
    map.locate().on('locationfound', e => {
      map.flyTo(e.latlng, 16);
      L.marker(e.latlng, {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzMwODFmZiIgZmlsbC1vcGFjaXR5PSIwLjIiIHN0cm9rZT0iIzMwODFmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiMzMDgxZmYiLz4KPC9zdmc+',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map).bindPopup('Your Location').openPopup();
      onLocate(e.latlng);
    }).on('locationerror', () => {
      alert('Please enable location access to use this feature');
    });
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={handleLocate}
        title="Locate Me"
        className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-110 transition border-2 border-slate-200 hover:border-blue-400"
      >
        <LocateFixed className="w-5 h-5 text-blue-600" />
      </button>
      <button
        onClick={onRefresh}
        title="Refresh Map"
        className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-110 transition border-2 border-slate-200 hover:border-blue-400"
      >
        <RefreshCw className="w-5 h-5 text-blue-600" />
      </button>
    </div>
  );
};

// --- Auto fit map bounds to markers ---
const AutoFitBounds = ({ incidents }) => {
  const map = useMap();

  useEffect(() => {
    if (incidents && incidents.length > 0) {
      const bounds = L.latLngBounds(
        incidents
          .filter(i => i.lat && i.lng && !isNaN(parseFloat(i.lat)) && !isNaN(parseFloat(i.lng)))
          .map(i => [parseFloat(i.lat), parseFloat(i.lng)])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [incidents, map]);

  return null;
};

const MapView = () => {
  const { incidents, fetchIncidents, loading } = useIncidents();
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const incidentsWithLocation = incidents.filter(
    i => i.lat && i.lng && !isNaN(parseFloat(i.lat)) && !isNaN(parseFloat(i.lng))
  );

  if (loading && incidents.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Live Incident Map</h2>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Real-time incident location tracking ({incidentsWithLocation.length} incidents)
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="relative h-[500px] sm:h-[600px] rounded-xl overflow-hidden z-10">
          <MapContainer center={[34.0151, 71.5249]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <LayersControl position="topleft">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Dark Mode">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution="&copy; CARTO"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Esri"
                />
              </LayersControl.BaseLayer>
              <LayersControl.Overlay checked name="Show Incidents">
                {incidentsWithLocation.map(inc => (
                  <Marker
                    key={inc.id}
                    position={[parseFloat(inc.lat), parseFloat(inc.lng)]}
                    icon={getIncidentIcon(inc.severity)}
                    eventHandlers={{ click: () => setSelectedIncidentId(inc.id) }}
                  >
                    <Popup>
                      <div className="w-64">
                        <h4 className="font-bold text-slate-900 mb-2">{inc.title || 'Untitled'}</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-slate-600">Location:</span>
                            <span className="text-slate-900 ml-2">{inc.location}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Type:</span>
                            <span className="text-slate-900 ml-2">{inc.type}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Severity:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                              inc.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              inc.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              inc.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {inc.severity || 'medium'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                              inc.status === 'open' ? 'bg-orange-100 text-orange-700' :
                              inc.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {inc.status || 'open'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Reported by:</span>
                            <span className="ml-2">{inc.reporterName || "Anonymous"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">At:</span>
                            <span className="ml-2">{inc.createdAt ? new Date(inc.createdAt).toLocaleString() : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayersControl.Overlay>
            </LayersControl>

            {/* User's live location marker */}
            <UserLocationMarker />

            <AutoFitBounds incidents={incidentsWithLocation} />
            <MapControls onLocate={() => {}} onRefresh={fetchIncidents} />
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="p-6 bg-slate-50 border-t-2 border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Severity Legend
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Low', color: '#10b981' },
              { label: 'Medium', color: '#f59e0b' },
              { label: 'High', color: '#ef4444' },
              { label: 'Critical', color: '#dc2626' }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
