import React from 'react';
import { MapPin, Clock, TrendingUp, CheckCircle, Eye } from 'lucide-react';

const IncidentCard = ({ incident, onClick }) => {
  const severityColors = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  const statusConfig = {
    open: { icon: Clock, color: 'text-blue-600', label: 'Open' },
    'in-progress': { icon: TrendingUp, color: 'text-yellow-600', label: 'In Progress' },
    resolved: { icon: CheckCircle, color: 'text-green-600', label: 'Resolved' },
  };

  const status = statusConfig[incident.status] || statusConfig.open;
  const StatusIcon = status.icon;

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {incident.type}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{incident.location}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            severityColors[incident.severity]
          }`}
        >
          {incident.severity}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <StatusIcon size={16} className={status.color} />
          <span className="text-gray-600">{status.label}</span>
        </div>
        <span className="text-gray-500">{incident.time}</span>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Assigned to: <span className="font-medium text-gray-700">{incident.assignedTo}</span>
        </p>
        <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-medium">
          <Eye size={14} />
          View
        </button>
      </div>
    </div>
  );
};

export default IncidentCard;