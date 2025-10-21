import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import IncidentCard from '../components/IncidentCard';
import MapView from '../components/MapView';
import { TrendChart, SeverityPieChart } from '../components/Chart';
import { fadeIn, staggerFadeIn } from '../animations/gsapAnimations';

// Mock data
const mockIncidents = [
  { id: 1, type: 'Theft', location: 'Cafeteria', severity: 'high', status: 'open', date: '2025-10-15', time: '14:30', description: 'Student reported missing laptop', assignedTo: 'Officer Ali' },
  { id: 2, type: 'Fight', location: 'Parking Lot', severity: 'medium', status: 'in-progress', date: '2025-10-15', time: '16:45', description: 'Physical altercation between two individuals', assignedTo: 'Officer Sara' },
  { id: 3, type: 'Intrusion', location: 'Main Gate', severity: 'low', status: 'resolved', date: '2025-10-14', time: '09:20', description: 'Unauthorized vehicle entry attempt', assignedTo: 'Officer Khan' },
];

const chartData = [
  { month: 'May', incidents: 12 },
  { month: 'Jun', incidents: 19 },
  { month: 'Jul', incidents: 15 },
  { month: 'Aug', incidents: 22 },
  { month: 'Sep', incidents: 18 },
  { month: 'Oct', incidents: 25 },
];

const severityData = [
  { name: 'High', value: 8, color: '#ef4444' },
  { name: 'Medium', value: 12, color: '#f59e0b' },
  { name: 'Low', value: 15, color: '#10b981' },
];

const Dashboard = () => {
  const statsRef = useRef([]);
  const chartsRef = useRef([]);

  useEffect(() => {
    // Animate stats cards
    if (statsRef.current.length > 0) {
      staggerFadeIn(statsRef.current, 0.3, 0.1);
    }
    
    // Animate charts
    if (chartsRef.current.length > 0) {
      chartsRef.current.forEach((el, i) => {
        if (el) fadeIn(el, 0.5, 0.2 * (i + 1));
      });
    }
  }, []);

  const stats = [
    { label: 'Total Incidents', value: '35', change: '+12%', icon: AlertTriangle, color: 'bg-blue-500', trend: 'up' },
    { label: 'Active Cases', value: '8', change: '+3', icon: Clock, color: 'bg-yellow-500', trend: 'up' },
    { label: 'Resolved', value: '27', change: '+5', icon: CheckCircle, color: 'bg-green-500', trend: 'up' },
    { label: 'High Priority', value: '5', change: '-2', icon: AlertTriangle, color: 'bg-red-500', trend: 'down' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of security incidents and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              ref={(el) => (statsRef.current[index] = el)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp 
                      size={14} 
                      className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600 rotate-180'} 
                    />
                    <p className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map View */}
      <div ref={(el) => (chartsRef.current[0] = el)} className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Incident Hotspots</h3>
        <MapView incidents={mockIncidents} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div ref={(el) => (chartsRef.current[1] = el)} className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Incident Trends</h3>
          <TrendChart data={chartData} />
        </div>

        <div ref={(el) => (chartsRef.current[2] = el)} className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
          <SeverityPieChart data={severityData} />
        </div>
      </div>

      {/* Recent Incidents */}
      <div ref={(el) => (chartsRef.current[3] = el)} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Incidents</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;