import React, { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Calendar, Filter, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useIncidents } from '../context/IncidentsContext';
import { analyticsAPI } from '../utils/api';

const Reports = () => {
  const { incidents, fetchIncidents, loading } = useIncidents();
  const [analyticsData, setAnalyticsData] = useState({ bySeverity: [], byType: [], byLocation: [] });
  const [timeRange, setTimeRange] = useState('7days');
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    fetchIncidents();
    loadAnalytics();
  }, [fetchIncidents]);

  const loadAnalytics = async () => {
    try {
      const dashboardData = await analyticsAPI.getDashboardStats();
      setAnalyticsData({
        bySeverity: dashboardData.bySeverity && dashboardData.bySeverity.length
          ? dashboardData.bySeverity
          : calculateBySeverity(incidents),
        byType: dashboardData.byType && dashboardData.byType.length
          ? dashboardData.byType
          : calculateByType(incidents),
        byLocation: await analyticsAPI.getHotspots().catch(() => calculateHotspots(incidents)) || calculateHotspots(incidents)
      });
    } catch (err) {
      console.error('Analytics error:', err);
      setAnalyticsData({
        bySeverity: calculateBySeverity(incidents),
        byType: calculateByType(incidents),
        byLocation: calculateHotspots(incidents)
      });
    }
  };

  const calculateBySeverity = (incidents) => [
    { name: 'Low', value: incidents.filter(i => i.severity === 'low').length, color: '#10b981' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: incidents.filter(i => i.severity === 'high').length, color: '#ef4444' },
    { name: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: '#dc2626' }
  ];

  const calculateByType = (incidents) => {
    const counts = {};
    incidents.forEach(i => {
      const t = i.type || 'Other';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const calculateHotspots = (incidents) => {
    const locationCount = {};
    incidents.forEach(i => {
      if (i.location) locationCount[i.location] = (locationCount[i.location] || 0) + 1;
    });
    return Object.entries(locationCount)
      .map(([location, count]) => ({
        location,
        count,
        severity: incidents.find(x => x.location === location)?.severity || 'medium'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  useEffect(() => {
    if (incidents.length) loadAnalytics();
  }, [incidents.length]);

  if (loading && incidents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#dc2626'];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Analytics & Reports</h2>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Comprehensive incident analytics ({incidents.length} incidents)
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Time Range & Export Controls */}
      <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Time Period
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-900 mb-2">Export Format</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="pdf">PDF Report</option>
            <option value="csv">CSV Data</option>
            <option value="xlsx">Excel</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Incidents by Severity</h3>
              <p className="text-sm text-slate-600">Distribution overview</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.bySeverity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.bySeverity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Type Distribution */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Incidents by Type</h3>
              <p className="text-sm text-slate-600">Category breakdown</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.byType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" width={80} stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hotspots Table */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Top Incident Hotspots</h3>
            <p className="text-sm text-slate-600">Areas with most incidents</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 px-4 font-bold text-slate-900">Location</th>
                <th className="text-center py-3 px-4 font-bold text-slate-900">Incidents</th>
                <th className="text-center py-3 px-4 font-bold text-slate-900">Severity</th>
                <th className="text-right py-3 px-4 font-bold text-slate-900">%</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.byLocation.map((spot, idx) => {
                const percentage = ((spot.count / incidents.length) * 100).toFixed(1);
                return (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="py-4 px-4 font-medium text-slate-900">{spot.location}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                        {spot.count}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                        spot.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        spot.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        spot.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {spot.severity || 'medium'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-slate-900 font-bold">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Report Generator */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Filter className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Generate Custom Report</h3>
            <p className="text-sm text-slate-600">Filter and export incident data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Incident Type</label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>All Types</option>
              <option>Theft</option>
              <option>Violence</option>
              <option>Intrusion</option>
              <option>Fire</option>
              <option>Medical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Status</label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Open</option>
              <option>Investigating</option>
              <option>Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Location</label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>All Locations</option>
              {analyticsData.byLocation.map((spot, idx) => (
                <option key={idx} value={spot.location}>{spot.location}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn-primary flex items-center gap-2">
          <Download className="w-5 h-5" />
          Generate & Export Report
        </button>
      </div>
    </div>
  );
};

export default Reports;
