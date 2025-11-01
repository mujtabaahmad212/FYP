import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useIncidents } from '../context/IncidentsContext';
import { analyticsAPI } from '../utils/api';

const Dashboard = () => {
  const { incidents, fetchIncidents, loading } = useIncidents();
  const [analytics, setAnalytics] = useState({
    weekly: [],
    byType: []
  });
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    highPriority: 0
  });

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
        highPriority: dashboardData.highPriority || 0,
      });
      
      if (dashboardData.weeklyTrend && dashboardData.weeklyTrend.length > 0) {
        setAnalytics(prev => ({ ...prev, weekly: dashboardData.weeklyTrend }));
      } else {
        // Generate mock weekly data from incidents
        const weekly = generateWeeklyData(incidents);
        setAnalytics(prev => ({ ...prev, weekly }));
      }
      
      if (dashboardData.byType && dashboardData.byType.length > 0) {
        setAnalytics(prev => ({ ...prev, byType: dashboardData.byType }));
      } else {
        // Generate byType data from incidents
        const byType = generateByTypeData(incidents);
        setAnalytics(prev => ({ ...prev, byType }));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Use calculated stats from incidents
      calculateStatsFromIncidents();
    }
  };

  const calculateStatsFromIncidents = () => {
    const total = incidents.length;
    const open = incidents.filter(i => i.status === 'open').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const highPriority = incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length;
    
    setStats({ total, open, resolved, highPriority });
    
    const weekly = generateWeeklyData(incidents);
    const byType = generateByTypeData(incidents);
    setAnalytics({ weekly, byType });
  };

  const generateWeeklyData = (incidents) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    
    return days.map(day => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + days.indexOf(day));
      const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));
      
      const count = incidents.filter(inc => {
        const incDate = new Date(inc.createdAt || inc.timestamp || Date.now());
        return incDate >= dayStart && incDate <= dayEnd;
      }).length;
      
      return { day, incidents: count || 0 };
    });
  };

  const generateByTypeData = (incidents) => {
    const typeCount = {};
    incidents.forEach(inc => {
      const type = inc.type || 'Other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  };

  useEffect(() => {
    if (incidents.length > 0) {
      calculateStatsFromIncidents();
    }
  }, [incidents]);

  const severityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const statCards = [
    {
      title: 'Total Incidents',
      value: stats.total,
      change: '+12%',
      changeType: 'positive',
      icon: AlertTriangle,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Open Cases',
      value: stats.open,
      change: 'Requires attention',
      changeType: 'warning',
      icon: Clock,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      change: 'Avg. 4.2h response',
      changeType: 'neutral',
      icon: CheckCircle,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      change: 'Urgent attention',
      changeType: 'negative',
      icon: XCircle,
      color: 'red',
      bgGradient: 'from-red-500 to-red-600'
    }
  ];

  const recentIncidents = incidents
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.timestamp || 0);
      const dateB = new Date(b.createdAt || b.timestamp || 0);
      return dateB - dateA;
    })
    .slice(0, 5);

  if (loading && incidents.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gradient-text mb-2">Dashboard Overview</h2>
        <p className="text-slate-600">Real-time security monitoring and analytics</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover group relative overflow-hidden animate-fadeIn"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-600 text-sm font-medium">{card.title}</h3>
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{card.value}</p>
                <p className={`text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' :
                  card.changeType === 'negative' ? 'text-red-600' :
                  card.changeType === 'warning' ? 'text-orange-600' :
                  'text-slate-600'
                }`}>
                  {card.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Weekly Incident Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.weekly.length > 0 ? analytics.weekly : [
              { day: 'Mon', incidents: 0 },
              { day: 'Tue', incidents: 0 },
              { day: 'Wed', incidents: 0 },
              { day: 'Thu', incidents: 0 },
              { day: 'Fri', incidents: 0 },
              { day: 'Sat', incidents: 0 },
              { day: 'Sun', incidents: 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="incidents" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Incidents by Type</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={analytics.byType.length > 0 ? analytics.byType : [{ name: 'No Data', value: 1 }]} 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                fill="#8884d8" 
                dataKey="value" 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(analytics.byType.length > 0 ? analytics.byType : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Recent Incidents</h3>
        </div>
        <div className="space-y-3">
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse" 
                    style={{backgroundColor: severityColors[incident.severity] || severityColors.medium}}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{incident.title || 'Untitled Incident'}</p>
                    <p className="text-sm text-slate-600 truncate">
                      {incident.location || 'Location not specified'} • {
                        incident.timestamp || incident.createdAt 
                          ? new Date(incident.timestamp || incident.createdAt).toLocaleString()
                          : 'Date not available'
                      }
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ml-4 ${
                  incident.status === 'open' 
                    ? 'bg-orange-100 text-orange-700' 
                    : incident.status === 'investigating' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                }`}>
                  {incident.status || 'open'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No incidents reported yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
