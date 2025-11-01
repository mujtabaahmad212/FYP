import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin, Phone, User, Calendar } from 'lucide-react';
import { useIncidents } from '../context/IncidentsContext';

const TrackIncident = () => {
  const { getIncidentByTrackingId, loading } = useIncidents();
  const [incident, setIncident] = useState(null);
  const [trackingId, setTrackingId] = useState(null);

  useEffect(() => {
    // Get tracking ID from localStorage
    const storedId = localStorage.getItem('viewerIncidentId');
    if (storedId) {
      setTrackingId(storedId);
      loadIncident(storedId);
    }
  }, []);

  const loadIncident = async (id) => {
    try {
      const foundIncident = await getIncidentByTrackingId(id);
      setIncident(foundIncident);
    } catch (error) {
      console.error('Error loading incident:', error);
      setIncident(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
            <p className="text-slate-600">Loading incident details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gradient-text mb-2">Track Your Report</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center card-hover">
          <AlertTriangle className="w-20 h-20 text-slate-400 mx-auto mb-6" />
          <p className="text-xl font-semibold text-slate-700 mb-2">No incident report found</p>
          <p className="text-slate-600 mb-6">Please submit a report first to track its progress.</p>
          {trackingId && (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Your Tracking ID:</p>
              <p className="text-2xl font-bold text-slate-900">#{trackingId}</p>
              <p className="text-sm text-slate-500 mt-2">If you recently submitted a report, it may take a few moments to appear.</p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Report New Incident
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gradient-text mb-2">Track Your Report</h2>
        <p className="text-slate-600">Monitor the status of your reported incident</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 card-hover animate-scaleIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{incident.title || 'Untitled Incident'}</h3>
            <p className="text-slate-600 flex items-center gap-2">
              <span>Report ID:</span>
              <span className="font-semibold text-blue-600">#{incident.id}</span>
            </p>
          </div>
          <span className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm ${
            incident.status === 'open' 
              ? 'bg-orange-100 text-orange-700' 
              : incident.status === 'investigating' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
          }`}>
            {(incident.status || 'open').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Type</p>
              <p className="font-semibold text-slate-900">{incident.type || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Location</p>
              <p className="font-semibold text-slate-900">{incident.location || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Reported On</p>
              <p className="font-semibold text-slate-900">
                {incident.timestamp || incident.createdAt 
                  ? new Date(incident.timestamp || incident.createdAt).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Assigned Officer</p>
              <p className="font-semibold text-slate-900">{incident.assignedTo || 'Not assigned yet'}</p>
            </div>
          </div>
        </div>

        {incident.description && (
          <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600 mb-2 font-medium">Description</p>
            <p className="text-slate-900">{incident.description}</p>
          </div>
        )}

        <div className="border-t border-slate-200 pt-6">
          <h4 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Progress Timeline
          </h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 pt-1">
                <p className="font-semibold text-slate-900">Report Submitted</p>
                <p className="text-sm text-slate-600 mt-1">
                  {incident.timestamp || incident.createdAt 
                    ? new Date(incident.timestamp || incident.createdAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            
            {incident.status !== 'open' && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-slate-900">Investigation Started</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {incident.assignedTo !== 'Pending Assignment' && incident.assignedTo !== 'Pending'
                      ? `Officer ${incident.assignedTo} assigned to your case`
                      : 'Officer assigned to your case'}
                  </p>
                </div>
              </div>
            )}
            
            {incident.status === 'resolved' && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-slate-900">Case Resolved</p>
                  <p className="text-sm text-slate-600 mt-1">Incident has been successfully resolved</p>
                </div>
              </div>
            )}
            
            {incident.status === 'open' && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-slate-900">Awaiting Assignment</p>
                  <p className="text-sm text-slate-600 mt-1">Your report is being reviewed by security personnel</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 card-hover">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 mb-1">Thank you for reporting!</p>
            <p className="text-sm text-green-800">
              We take all incidents seriously and will keep you updated on the progress. 
              You can check back here anytime to see the latest status. Your report is visible to administrators and officers for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackIncident;
