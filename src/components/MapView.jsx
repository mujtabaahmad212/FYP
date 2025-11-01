import React, { useState, useEffect } from 'react';
import { MapPin, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { useIncidents } from '../context/IncidentsContext';

const MapView = () => {
  const { incidents, fetchIncidents, loading } = useIncidents();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const severityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  const baseLat = 34.0151;
  const baseLng = 71.5249;

  // Filter incidents with valid coordinates
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden card-hover">
        <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 rounded-t-2xl p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-900">Incident Overview</span>
            </div>
            <span className="text-sm text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {incidents.length} Total Incidents
            </span>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-slate-100 to-blue-50 rounded-b-2xl h-96 sm:h-[500px] overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-slate-100 to-blue-50 opacity-50"></div>
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
              backgroundSize: `${50 * zoom}px ${50 * zoom}px`
            }}
          ></div>

          {/* Incident Markers */}
          {incidentsWithLocation.map((incident) => {
            const offsetX = (parseFloat(incident.lng) - baseLng) * 50000 * zoom;
            const offsetY = (baseLat - parseFloat(incident.lat)) * 50000 * zoom;
            const positionX = 50 + offsetX;
            const positionY = 50 + offsetY;

            return (
              <div
                key={incident.id}
                className="absolute cursor-pointer group"
                style={{
                  left: `${Math.max(5, Math.min(95, positionX))}%`,
                  top: `${Math.max(5, Math.min(95, positionY))}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: selectedIncident?.id === incident.id ? 20 : 10
                }}
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="relative">
                  <div
                    className={`w-6 h-6 rounded-full shadow-lg transition-all duration-300 ${
                      selectedIncident?.id === incident.id ? 'scale-150' : 'group-hover:scale-125 animate-pulse'
                    }`}
                    style={{
                      backgroundColor: severityColors[incident.severity] || severityColors.medium,
                      boxShadow: `0 0 0 0 ${severityColors[incident.severity] || severityColors.medium}40`
                    }}
                  >
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: severityColors[incident.severity] || severityColors.medium }}></div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap transition-all duration-200 ${
                    selectedIncident?.id === incident.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                  }`}>
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl">
                      <p className="font-semibold">{incident.title || 'Untitled Incident'}</p>
                      <p className="text-xs text-slate-300 mt-1">{incident.location || 'Location not specified'}</p>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 bg-slate-900 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Center Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <MapPin className="w-8 h-8 text-blue-600 drop-shadow-lg" />
            <div className="absolute inset-0 animate-ping">
              <MapPin className="w-8 h-8 text-blue-600 opacity-30" />
            </div>
          </div>

          {/* Placeholder Text */}
          {incidentsWithLocation.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">No incidents with location data</p>
                <p className="text-sm text-slate-500 mt-2">Peshawar, Khyber Pakhtunkhwa</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
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

      {/* Incident Details */}
      {selectedIncident && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 animate-scaleIn">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{selectedIncident.title || 'Untitled Incident'}</h3>
              <p className="text-slate-600 mt-1">{selectedIncident.location || 'Location not specified'}</p>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Type:</span>
              <span className="ml-2 font-medium">{selectedIncident.type || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600">Status:</span>
              <span className={`ml-2 font-medium px-2 py-1 rounded ${
                selectedIncident.status === 'open' 
                  ? 'bg-orange-100 text-orange-700' 
                  : selectedIncident.status === 'investigating' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
              }`}>
                {selectedIncident.status || 'open'}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Severity:</span>
              <span 
                className="ml-2 font-medium px-2 py-1 rounded text-white text-xs"
                style={{backgroundColor: severityColors[selectedIncident.severity] || severityColors.medium}}
              >
                {(selectedIncident.severity || 'medium').toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Reported:</span>
              <span className="ml-2 font-medium">
                {selectedIncident.timestamp || selectedIncident.createdAt 
                  ? new Date(selectedIncident.timestamp || selectedIncident.createdAt).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
