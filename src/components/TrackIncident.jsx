import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Clock, MapPin, User, Calendar, Phone, Mail, ArrowLeft, Search, Loader } from 'lucide-react';
import { useIncidents } from '../context/IncidentsContext';
import { useNavigate } from 'react-router-dom';

const TrackIncident = () => {
  const { getIncidentByTrackingId } = useIncidents();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [trackingId, setTrackingId] = useState(localStorage.getItem('viewerIncidentId') || '');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const loadIncident = async (id) => {
    if (!id.trim()) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const found = await getIncidentByTrackingId(id);
      setIncident(found);
    } catch (err) {
      console.error('Error loading incident:', err);
      setIncident(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadIncident(trackingId);
  };

  useEffect(() => {
    if (trackingId && !searched) {
      loadIncident(trackingId);
    }
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      open: { icon: Clock, color: 'from-orange-500 to-orange-600', label: 'Open', description: 'Report received and pending review' },
      investigating: { icon: AlertTriangle, color: 'from-blue-500 to-blue-600', label: 'Investigating', description: 'Our team is actively investigating' },
      resolved: { icon: CheckCircle, color: 'from-green-500 to-green-600', label: 'Resolved', description: 'Case has been successfully resolved' }
    };
    return configs[status] || configs.open;
  };

  const getSeverityIcon = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[severity?.toLowerCase()] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-3xl mx-auto mb-8">
        <button
          onClick={() => navigate('/viewer')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Track Your Report</h1>
          <p className="text-slate-600 text-lg">Check the status of your incident report in real-time</p>
        </div>

        {/* Search Card */}
        <div className="card mb-8 animate-in">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Tracking ID</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your tracking ID (e.g., 1234567890)"
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 px-8 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="card text-center py-12 animate-in">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Searching for your report...</p>
          </div>
        ) : incident ? (
          <div className="space-y-6 animate-in">
            {/* Main Status Card */}
            <div className="card overflow-hidden">
              {(() => {
                const config = getStatusConfig(incident.status);
                const Icon = config.icon;
                return (
                  <div className={`bg-gradient-to-r ${config.color} text-white p-8 rounded-xl mb-6 flex items-center justify-between`}>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{config.label}</h2>
                      <p className="text-white/90">{config.description}</p>
                    </div>
                    <Icon className="w-16 h-16 opacity-20" />
                  </div>
                );
              })()}

              {/* Incident Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{incident.title || 'Untitled Incident'}</h3>
                  <p className="text-slate-600">Report ID: <span className="font-mono font-bold text-blue-600">#{incident.id}</span></p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Type</p>
                      <p className="text-slate-900 font-bold">{incident.type || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 ${getSeverityIcon(incident.severity)}`}></div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Severity</p>
                      <p className="text-slate-900 font-bold capitalize">{incident.severity || 'Medium'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Location</p>
                      <p className="text-slate-900 font-bold">{incident.location || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Reported</p>
                      <p className="text-slate-900 font-bold">
                        {incident.timestamp || incident.createdAt
                          ? new Date(incident.timestamp || incident.createdAt).toLocaleString()
                          : 'Not available'}
                      </p>
                    </div>
                  </div>

                  {incident.assignedTo && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Assigned Officer</p>
                        <p className="text-slate-900 font-bold">{incident.assignedTo}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {incident.description && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <p className="text-sm text-slate-600 font-bold mb-2">Description</p>
                    <p className="text-slate-900 leading-relaxed">{incident.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="card">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Progress Timeline</h3>
              <div className="space-y-4">
                {/* Submitted */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">1</div>
                    <div className="w-1 h-16 bg-gradient-to-b from-green-500 to-slate-300 mt-2"></div>
                  </div>
                  <div className="pb-8">
                    <h4 className="font-bold text-slate-900">Report Submitted</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {incident.timestamp || incident.createdAt
                        ? new Date(incident.timestamp || incident.createdAt).toLocaleString()
                        : 'Date not available'}
                    </p>
                  </div>
                </div>

                {/* Investigating */}
                {incident.status !== 'open' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">2</div>
                      <div className="w-1 h-16 bg-gradient-to-b from-blue-500 to-slate-300 mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <h4 className="font-bold text-slate-900">Investigation Started</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {incident.assignedTo && incident.assignedTo !== 'Pending'
                          ? `Officer ${incident.assignedTo} is investigating`
                          : 'Officer has been assigned'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Resolved */}
                {incident.status === 'resolved' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Case Resolved</h4>
                      <p className="text-sm text-slate-600 mt-1">Incident has been successfully resolved</p>
                    </div>
                  </div>
                )}

                {/* Pending */}
                {incident.status === 'open' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-white animate-pulse">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Awaiting Assignment</h4>
                      <p className="text-sm text-slate-600 mt-1">Your report is being reviewed by our team</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Card */}
            {(incident.reporterPhone || incident.reporterEmail) && (
              <div className="card">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information on File</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {incident.reporterPhone && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="font-bold text-slate-900">{incident.reporterPhone}</p>
                      </div>
                    </div>
                  )}
                  {incident.reporterEmail && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-bold text-slate-900">{incident.reporterEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thank You Message */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
              <h4 className="font-bold text-green-900 mb-2">Thank You!</h4>
              <p className="text-green-800">
                We appreciate your vigilance in reporting this incident. Our team is committed to ensuring your safety.
                You can return to this page anytime to check for updates.
              </p>
            </div>
          </div>
        ) : searched ? (
          <div className="card text-center py-12 animate-in">
            <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Report Found</h2>
            <p className="text-slate-600 mb-6">We couldn't find a report with that tracking ID. Please double-check and try again.</p>
            <button
              onClick={() => setSearched(false)}
              className="btn-primary"
            >
              Search Again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TrackIncident;
