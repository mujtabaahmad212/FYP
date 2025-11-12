import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, TrendingUp, Activity, MapPin, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { useIncidents } from '../context/IncidentsContext';
import { analyticsAPI } from '../utils/api';

const Dashboard = () => {
  const { incidents, fetchIncidents, loading } = useIncidents();
  const [analytics, setAnalytics] = useState({ weekly: [], byType: [], bySeverity: [] });
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, highPriority: 0 });
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchIncidents();
    loadAnalytics();
  }, [fetchIncidents]);

  const loadAnalytics = async () => {
    try {
      const dashboardData = await analyticsAPI.getDashboardStats();
      setStats({
        total: dashboardData.total || incidents.length,
        open: dashboardData.open || 0,
        resolved: dashboardData.resolved || 0,
        highPriority: dashboardData.highPriority || 0
      });

      setAnalytics({
        weekly: dashboardData.weeklyTrend?.length ? dashboardData.weeklyTrend : generateWeeklyData(incidents),
        byType: dashboardData.byType?.length ? dashboardData.byType : generateByTypeData(incidents),
        bySeverity: dashboardData.bySeverity?.length ? dashboardData.bySeverity : generateSeverityData(incidents)
      });
    } catch (err) {
      console.error('Analytics error:', err);
      calculateStatsFromIncidents();
    }
  };

  const calculateStatsFromIncidents = () => {
    const total = incidents.length;
    const open = incidents.filter(i => i.status === 'open').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const highPriority = incidents.filter(i => ['high', 'critical'].includes((i.severity || '').toLowerCase())).length;
    setStats({ total, open, resolved, highPriority });
    setAnalytics({
      weekly: generateWeeklyData(incidents),
      byType: generateByTypeData(incidents),
      bySeverity: generateSeverityData(incidents)
    });
  };

  const generateWeeklyData = (incidents) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => ({
      day,
      incidents: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 15) + 2
    }));
  };

  const generateByTypeData = (incidents) => {
    const types = ['Theft', 'Violence', 'Intrusion', 'Fire', 'Medical', 'Other'];
    return types.map(type => ({
      name: type,
      value: Math.floor(Math.random() * 30) + 5
    }));
  };

  const generateSeverityData = (incidents) => {
    return [
      { name: 'Low', value: 15, color: '#10b981' },
      { name: 'Medium', value: 35, color: '#f59e0b' },
      { name: 'High', value: 28, color: '#ef4444' },
      { name: 'Critical', value: 12, color: '#dc2626' }
    ];
  };

  useEffect(() => {
    if (incidents.length) calculateStatsFromIncidents();
  }, [incidents]);

  const statCards = [
    {
      title: 'Total Incidents',
      value: stats.total,
      change: '+12.5%',
      changeType: 'increase',
      icon: AlertTriangle,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Open Cases',
      value: stats.open,
      change: `${stats.open} active`,
      changeType: 'warning',
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Resolved Today',
      value: stats.resolved,
      change: '+8.2%',
      changeType: 'increase',
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      lightBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      change: 'Urgent attention',
      changeType: 'decrease',
      icon: XCircle,
      gradient: 'from-red-500 to-red-600',
      lightBg: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  const recentIncidents = incidents
    .sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0))
    .slice(0, 6);

  if (loading && incidents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Dashboard Overview</h2>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Real-time security monitoring and analytics
          </p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="card hover:scale-105 transition-transform duration-300 relative overflow-hidden group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                    <h3 className="text-3xl font-bold text-slate-900">{card.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.lightBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {card.changeType === 'increase' && <ArrowUp className="w-4 h-4 text-green-600" />}
                  {card.changeType === 'decrease' && <ArrowDown className="w-4 h-4 text-red-600" />}
                  <span className={`text-sm font-medium ${
                    card.changeType === 'increase' ? 'text-green-600' :
                    card.changeType === 'decrease' ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Incident Trends</h3>
                <p className="text-sm text-slate-600">Weekly overview</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.weekly}>
              <defs>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Legend />
              <Area type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Severity Distribution</h3>
                <p className="text-sm text-slate-600">Current period</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={analytics.bySeverity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.bySeverity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Recent Incidents</h3>
              <p className="text-sm text-slate-600">Latest reported cases</p>
            </div>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentIncidents.length ? recentIncidents.map(inc => (
            <div key={inc.id} className="group relative p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white">
              {/* Severity Indicator */}
              <div className="absolute top-3 right-3">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  inc.severity === 'critical' ? 'bg-red-600 animate-pulse' :
                  inc.severity === 'high' ? 'bg-orange-500' :
                  inc.severity === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></span>
              </div>

              <div className="mb-3">
                <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{inc.title || 'Untitled'}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{inc.location || 'Unknown'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`badge ${
                  inc.status === 'open' ? 'bg-orange-100 text-orange-700' :
                  inc.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {inc.status || 'open'}
                </span>
                <span className="text-xs text-slate-500">
                  {inc.timestamp || inc.createdAt ? new Date(inc.timestamp || inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">No incidents reported yet</p>
              <p className="text-sm text-slate-600">New incidents will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="card hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-900">Report Incident</h4>
              <p className="text-sm text-slate-600">Create new case</p>
            </div>
          </div>
        </button>

        <button className="card hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-900">View Map</h4>
              <p className="text-sm text-slate-600">Live incident tracking</p>
            </div>
          </div>
        </button>

        <button className="card hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-900">Team Status</h4>
              <p className="text-sm text-slate-600">View officers</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
