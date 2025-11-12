import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertTriangle, Filter, Download, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { useIncidents } from '../context/IncidentsContext';
import { useAuth } from '../context/AuthContext';

const IncidentList = () => {
  const { incidents, loading, fetchIncidents, updateIncidentStatus, deleteIncident } = useIncidents();
  const { userRole, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (isAuthenticated && (userRole === 'admin' || userRole === 'officer')) {
      fetchIncidents();
    }
  }, [isAuthenticated, userRole, fetchIncidents]);

  const canEdit = userRole === 'admin' || userRole === 'officer';

  // Filter and search logic
  const filteredIncidents = incidents
    .filter(inc => {
      const matchesStatus = filter === 'all' || inc.status === filter;
      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchesType = typeFilter === 'all' || inc.type === typeFilter;
      const matchesSearch = searchQuery === '' || [
        inc.title,
        inc.location,
        inc.type,
        inc.description
      ].some(v => (v || '').toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSeverity && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0);
        case 'severity':
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateIncidentStatus(id, newStatus);
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (userRole !== 'admin') return;
    if (!window.confirm('Are you sure you want to delete this incident?')) return;

    try {
      await deleteIncident(id);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[severity] || colors.medium;
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gradient">Incident Management</h2>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Manage and track all security incidents ({incidents.length} total)
          </p>
        </div>
        {canEdit && (
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Incident
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search incidents by title, location, type..."
              className="pl-12 pr-4 py-3 w-full border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-3 border-2 border-slate-300 rounded-xl hover:border-blue-400 transition relative"
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-3 border-2 border-slate-300 rounded-xl hover:border-green-400 transition">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>

        {/* Expanded Filters */}
        {filterOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 animate-in">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Status</label>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Severity</label>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Theft">Theft</option>
                <option value="Violence">Violence</option>
                <option value="Fire">Fire</option>
                <option value="Medical">Medical</option>
                <option value="Intrusion">Intrusion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="severity">Highest Severity</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Incidents Grid/List */}
      {filteredIncidents.length === 0 ? (
        <div className="card text-center py-16">
          <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No incidents found</h3>
          <p className="text-slate-600">
            {searchQuery || filter !== 'all' || severityFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No incidents have been reported yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.map(incident => (
            <div
              key={incident.id}
              className="card group hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              {/* Severity Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
                incident.severity === 'critical' ? 'from-red-600 to-red-500' :
                incident.severity === 'high' ? 'from-orange-600 to-orange-500' :
                incident.severity === 'medium' ? 'from-yellow-600 to-yellow-500' :
                'from-green-600 to-green-500'
              }`}></div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pl-4">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <h3 className="text-xl font-bold text-slate-900 flex-1 line-clamp-1">{incident.title || 'Untitled'}</h3>
                    <span className={`badge whitespace-nowrap ${getSeverityColor(incident.severity)}`}>
                      {(incident.severity || 'medium').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-4">
                    <div>
                      <span className="font-medium text-slate-600">Type:</span>
                      <span className="text-slate-900 ml-2">{incident.type || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Location:</span>
                      <span className="text-slate-900 ml-2">{incident.location || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Reporter:</span>
                      <span className="text-slate-900 ml-2">{incident.reporterName || 'Anonymous'}</span>
                    </div>
                  </div>

                  {incident.description && (
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">{incident.description}</p>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex flex-col gap-3 items-stretch lg:items-end lg:min-w-max">
                  {canEdit && (
                    <select
                      value={incident.status || 'open'}
                      onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm border-2 transition ${
                        incident.status === 'open' ? 'bg-orange-50 border-orange-300 text-orange-700' :
                        incident.status === 'investigating' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                        'bg-green-50 border-green-300 text-green-700'
                      }`}
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  )}

                  <div className="flex gap-2">
                    {canEdit && (
                      <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition" title="Edit">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(incident.id)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentList;
