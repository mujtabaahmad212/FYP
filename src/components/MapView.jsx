import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useIncidents } from '../context/IncidentsContext';
import { Layers } from 'lucide-react';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapView = () => {
  const { incidents, fetchIncidents, loading } = useIncidents();
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const incidentsWithLocation = incidents.filter(inc => 
    inc.lat && inc.lng && 
    !isNaN(parseFloat(inc.lat)) && 
    !isNaN(parseFloat(inc.lng))
  );

  if (loading && incidents.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
            <p className="text-slate-600">Loading map data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gradient-text">Live Incident Map</h2>
          <p className="text-slate-600 mt-1">Real-time incident location tracking ({incidentsWithLocation.length} incidents on map)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden card-hover">
        <div className="relative h-96 sm:h-[500px]">
          <MapContainer center={[34.0151, 71.5249]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {incidentsWithLocation.map(incident => (
              <Marker 
                key={incident.id} 
                position={[parseFloat(incident.lat), parseFloat(incident.lng)]}
                eventHandlers={{
                  click: () => {
                    setSelectedIncident(incident);
                  },
                }}
              >
                <Popup>
                  <h3 className="font-semibold">{incident.title}</h3>
                  <p>{incident.location}</p>
                  <p>Severity: {incident.severity}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
              <span className="text-sm font-medium text-slate-700">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 shadow-sm"></div>
              <span className="text-sm font-medium text-slate-700">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
              <span className="text-sm font-medium text-slate-700">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-700 shadow-sm"></div>
              <span className="text-sm font-medium text-slate-700">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
