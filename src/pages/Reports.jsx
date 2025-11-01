import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIncidents } from '../context/IncidentsContext';
import { analyticsAPI } from '../utils/api';

const Reports = () => {
  const { incidents, fetchIncidents } = useIncidents();
  const [analyticsData, setAnalyticsData] = useState({
    bySeverity: [],
    byType: [],
    byLocation: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncidents();
    loadAnalytics();
  }, [fetchIncidents]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const dashboardData = await analyticsAPI.getDashboardStats();
      
      // Set analytics from backend or calculate from incidents
      if (dashboardData.bySeverity && dashboardData.bySeverity.length > 0) {
        setAnalyticsData(prev => ({ ...prev, bySeverity: dashboardData.bySeverity }));
      } else {
        const bySeverity = calculateBySeverity(incidents);
        setAnalyticsData(prev => ({ ...prev, bySeverity }));
      }

      if (dashboardData.byType && dashboardData.byType.length > 0) {
        setAnalyticsData(prev => ({ ...prev, byType: dashboardData.byType }));
      } else {
        const byType = calculateByType(incidents);
        setAnalyticsData(prev => ({ ...prev, byType }));
      }

      const hotspots = await analyticsAPI.getHotspots().catch(() => []);
      if (hotspots && hotspots.length > 0) {
        setAnalyticsData(prev => ({ ...prev, byLocation: hotspots }));
      } else {
        const byLocation = calculateHotspots(incidents);
        setAnalyticsData(prev => ({ ...prev, byLocation }));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Calculate from incidents
      setAnalyticsData({
        bySeverity: calculateBySeverity(incidents),
        byType: calculateByType(incidents),
        byLocation: calculateHotspots(incidents)
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateBySeverity = (incidents) => {
    const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
    incidents.forEach(inc => {
      const severity = inc.severity || 'medium';
      if (severityCount.hasOwnProperty(severity)) {
        severityCount[severity]++;
      }
    });
    return [
      { name: 'Low', value: severityCount.low },
      { name: 'Medium', value: severityCount.medium },
      { name: 'High', value: severityCount.high },
      { name: 'Critical', value: severityCount.critical }
    ];
  };

  const calculateByType = (incidents) => {
    const typeCount = {};
    incidents.forEach(inc => {
      const type = inc.type || 'Other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  };

  const calculateHotspots = (incidents) => {
    const locationCount = {};
    incidents.forEach(inc => {
      if (inc.location) {
        locationCount[inc.location] = (locationCount[inc.location] || 0) + 1;
      }
    });
    
    return Object.entries(locationCount)
      .map(([location, count]) => ({
        location,
        count,
        severity: incidents.find(i => i.location === location)?.severity || 'medium'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  useEffect(() => {
    if (incidents.length > 0) {
      loadAnalytics();
    }
  }, [incidents.length]);

  const severityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
            <p className="text-slate-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gradient-text">Analytics & Reports</h2>
          <p className="text-slate-600 mt-1">Comprehensive incident analytics and insights ({incidents.length} total incidents)</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift">
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Export PDF</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Incidents by Severity</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.bySeverity.length > 0 ? analyticsData.bySeverity : [
              { name: 'Low', value: 0 },
              { name: 'Medium', value: 0 },
              { name: 'High', value: 0 },
              { name: 'Critical', value: 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {(analyticsData.bySeverity.length > 0 ? analyticsData.bySeverity : []).map((entry, index) => (
                  <Bar key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Hotspot Locations</h3>
          </div>
          <div className="space-y-3">
            {analyticsData.byLocation.length > 0 ? (
              analyticsData.byLocation.map((spot, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{spot.location}</p>
                    <p className="text-sm text-slate-600">{spot.count} incidents reported</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{backgroundColor: severityColors[spot.severity] || severityColors.medium}}
                    ></div>
                    <span className="text-lg font-bold text-slate-700">{spot.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No location data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Generate Custom Report</h3>
            <p className="text-sm text-slate-600 mt-1">Filter and export incident data</p>
          </div>
          <button className="btn-primary px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift">
            <Download className="w-5 h-5 inline mr-2" />
            Export PDF
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Incident Type</label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option>All Types</option>
              <option>Theft</option>
              <option>Violence</option>
              <option>Intrusion</option>
              <option>Fire</option>
              <option>Medical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option>All Locations</option>
              {analyticsData.byLocation.map((spot, i) => (
                <option key={i} value={spot.location}>{spot.location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
