import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, AlertTriangle } from 'lucide-react';
import { useIncidents } from '../context/IncidentsContext';
import { useAuth } from '../context/AuthContext';

const IncidentList = ({ userRole }) => {
  const { incidents, loading, fetchIncidents, updateIncidentStatus, deleteIncident } = useIncidents();
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const severityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  // Fetch incidents when component mounts
  useEffect(() => {
    if (isAuthenticated && (userRole === 'admin' || userRole === 'officer')) {
      fetchIncidents();
    }
  }, [isAuthenticated, userRole, fetchIncidents]);

  const canEdit = userRole === 'admin' || userRole === 'officer';

  const filteredIncidents = incidents.filter(inc => {
    const matchesFilter = filter === 'all' || inc.status === filter;
    const matchesSearch = searchQuery === '' || 
      inc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (id, newStatus) => {
    if (!canEdit) return;
    try {
      await updateIncidentStatus(id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (userRole !== 'admin') return;
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await deleteIncident(id);
      } catch (error) {
        console.error('Error deleting incident:', error);
        alert('Failed to delete incident. Please try again.');
      }
    }
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
            <p className="text-slate-600">Loading incidents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gradient-text">Incident Management</h2>
          <p className="text-slate-600 mt-1">View and manage all security incidents ({incidents.length} total)</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => {/* Handle new incident */}} 
            className="btn-primary flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
          >
            <Plus className="w-5 h-5" />
            <span>New Incident</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search incidents by title, location, or type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
          />
        </div>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          className="px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
          <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700 mb-2">No incidents found</p>
          <p className="text-slate-600">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No incidents have been reported yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover animate-fadeIn"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 w-full lg:w-auto">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-xl font-semibold text-slate-900">{incident.title || 'Untitled Incident'}</h3>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                      style={{backgroundColor: severityColors[incident.severity] || severityColors.medium}}
                    >
                      {(incident.severity || 'medium').toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-900">Type:</span> {incident.type || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Location:</span> {incident.location || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Reporter:</span> {incident.reporter || 'Anonymous'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Phone:</span> {incident.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Time:</span> {incident.timestamp || incident.createdAt ? new Date(incident.timestamp || incident.createdAt).toLocaleString() : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Assigned:</span> {incident.assignedTo || 'Not assigned yet'}
                    </div>
                  </div>
                  {incident.description && (
                    <div className="mt-3 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">Description: </span>
                      {incident.description}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  {canEdit && (
                    <select 
                      value={incident.status || 'open'} 
                      onChange={(e) => handleStatusChange(incident.id, e.target.value)} 
                      className="px-4 py-2 border-2 border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  )}
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => handleDelete(incident.id)} 
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      Delete
                    </button>
                  )}
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

