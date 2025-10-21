import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Filter, Search } from 'lucide-react';
import IncidentCard from '../components/IncidentCard';
import { fadeIn } from '../animations/gsapAnimations';

const mockIncidents = [
  { id: 1, type: 'Theft', location: 'Cafeteria', severity: 'high', status: 'open', date: '2025-10-15', time: '14:30', description: 'Student reported missing laptop', assignedTo: 'Officer Ali' },
  { id: 2, type: 'Fight', location: 'Parking Lot', severity: 'medium', status: 'in-progress', date: '2025-10-15', time: '16:45', description: 'Physical altercation between two individuals', assignedTo: 'Officer Sara' },
  { id: 3, type: 'Intrusion', location: 'Main Gate', severity: 'low', status: 'resolved', date: '2025-10-14', time: '09:20', description: 'Unauthorized vehicle entry attempt', assignedTo: 'Officer Khan' },
  { id: 4, type: 'Medical Emergency', location: 'Library', severity: 'high', status: 'resolved', date: '2025-10-14', time: '11:15', description: 'Student collapsed, ambulance called', assignedTo: 'Officer Fatima' },
  { id: 5, type: 'Vandalism', location: 'Building A', severity: 'medium', status: 'open', date: '2025-10-13', time: '22:00', description: 'Graffiti on external walls', assignedTo: 'Officer Ali' },
  { id: 6, type: 'Suspicious Activity', location: 'Parking Lot', severity: 'low', status: 'open', date: '2025-10-13', time: '18:30', description: 'Unknown person loitering', assignedTo: 'Officer Khan' },
];

const IncidentForm = () => {
  const [showForm, setShowForm] = useState(false);
  const [incidents, setIncidents] = useState(mockIncidents);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    search: ''
  });
  const [formData, setFormData] = useState({
    type: 'Theft',
    location: '',
    severity: 'medium',
    description: '',
    evidence: null
  });

  const modalRef = useRef(null);

  useEffect(() => {
    if (showForm && modalRef.current) {
      fadeIn(modalRef.current, 0.3);
    }
  }, [showForm]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, evidence: e.target.files });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newIncident = {
      id: incidents.length + 1,
      ...formData,
      status: 'open',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      assignedTo: 'Unassigned'
    };

    setIncidents([newIncident, ...incidents]);
    setShowForm(false);
    setFormData({
      type: 'Theft',
      location: '',
      severity: 'medium',
      description: '',
      evidence: null
    });
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSeverity = filters.severity === 'all' || incident.severity === filters.severity;
    const matchesStatus = filters.status === 'all' || incident.status === filters.status;
    const matchesSearch = filters.search === '' || 
      incident.type.toLowerCase().includes(filters.search.toLowerCase()) ||
      incident.location.toLowerCase().includes(filters.search.toLowerCase()) ||
      incident.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-600 mt-1">Manage and track all security incidents</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          New Incident
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Filter size={16} />
          <span>Showing {filteredIncidents.length} of {incidents.length} incidents</span>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIncidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>

      {filteredIncidents.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No incidents found matching your filters.</p>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Report New Incident</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="Theft">Theft</option>
                  <option value="Fight">Fight</option>
                  <option value="Intrusion">Intrusion</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Vandalism">Vandalism</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Fire Hazard">Fire Hazard</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Cafeteria, Building A, Parking Lot"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity Level *
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="low">Low - Minor issue, no immediate threat</option>
                  <option value="medium">Medium - Requires attention</option>
                  <option value="high">High - Urgent, immediate action needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="4"
                  placeholder="Provide detailed information about the incident..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  multiple
                  accept="image/*,video/*,.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload photos, videos, or documents (Max 10MB each)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentForm;