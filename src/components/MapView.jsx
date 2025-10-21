import React from 'react';
import { MapPin } from 'lucide-react';

// Simple map placeholder - you can integrate react-leaflet later
const MapView = ({ incidents }) => {
  const locations = [
    { name: 'Cafeteria', x: 30, y: 40, severity: 'high', count: 12 },
    { name: 'Parking Lot', x: 60, y: 30, severity: 'medium', count: 8 },
    { name: 'Main Gate', x: 80, y: 60, severity: 'low', count: 6 },
    { name: 'Library', x: 20, y: 70, severity: 'low', count: 5 },
    { name: 'Building A', x: 50, y: 75, severity: 'medium', count: 4 },
  ];

  const severityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      {/* Simple grid background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Location markers */}
      {locations.map((location, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-fadeIn"
          style={{ left: `${location.x}%`, top: `${location.y}%` }}
        >
          <div className="relative group">
            <div className={`${severityColors[location.severity]} w-6 h-6 rounded-full animate-ping absolute opacity-75`}></div>
            <div className={`${severityColors[location.severity]} w-6 h-6 rounded-full relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}>
              <MapPin size={16} className="text-white" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                <div className="font-semibold">{location.name}</div>
                <div className="text-gray-300">{location.count} incidents</div>
              </div>
              <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1"></div>
            </div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Severity</div>
        <div className="space-y-1">
          {['high', 'medium', 'low'].map((severity) => (
            <div key={severity} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded-full ${severityColors[severity]}`}></div>
              <span className="capitalize text-gray-600">{severity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;