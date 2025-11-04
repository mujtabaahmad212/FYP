import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, MapPin, Phone, FileText, Send, CheckCircle } from 'lucide-react';
import { useIncidents } from '../context/IncidentsContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Ensure you have this file or remove the import if not
import '../styles/leaflet.css'; 

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelect, selectedLocation }) => {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  // Center map on selected location when it changes
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation, map.getZoom());
    }
  }, [selectedLocation, map]);

  return selectedLocation ? (
    <Marker
      position={[selectedLocation.lat, selectedLocation.lng]}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          onLocationSelect(position);
        },
      }}
    />
  ) : null;
};

const ReportIncidentForm = () => {
  const { reportPublicIncident, loading } = useIncidents();
  const [formData, setFormData] = useState({
    title: '',
    type: 'Theft',
    location: '',
    description: '',
    phone: '',
    severity: 'medium',
    coordinates: null // <-- ADDED: To store map coordinates
  });

  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [error, setError] = useState('');
  
  // State for default map center (Peshawar)
  const [mapCenter, setMapCenter] = useState([34.0151, 71.5249]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Get location coordinates (can be enhanced with geocoding)
      const incidentData = {
        title: formData.title,
        type: formData.type,
        location: formData.location,
        description: formData.description,
        phone: formData.phone,
        severity: formData.severity,
        // FIXED: Use coordinates from state or default if not set
        lat: formData.coordinates ? formData.coordinates.lat : mapCenter[0], 
        lng: formData.coordinates ? formData.coordinates.lng : mapCenter[1],
      };

      const response = await reportPublicIncident(incidentData);
      setTrackingId(response.trackingId || response.incident?.id);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        title: '',
        type: 'Theft',
        location: '',
        description: '',
        phone: '',
        severity: 'medium',
        coordinates: null // <-- Reset coordinates
      });
    } catch (err) {
      console.error('Error submitting incident:', err);
      setError(err.message || 'Failed to submit incident. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gradient-text mb-2">Report an Incident</h2>
        <p className="text-slate-600">Help keep your community safe by reporting security incidents</p>
      </div>

      {submitted ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border border-green-200 text-center animate-scaleIn">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Report Submitted Successfully!</h3>
          <p className="text-green-700 mb-4">Your incident has been reported and is being reviewed.</p>
          {trackingId && (
            <div className="bg-white rounded-lg p-4 mb-4 inline-block">
              <p className="text-sm text-green-600 mb-1">Your Tracking ID:</p>
              <p className="text-2xl font-bold text-green-900">#{trackingId}</p>
            </div>
          )}
          <p className="text-sm text-green-600 mb-4">You can now track your report using the tracking ID above.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setTrackingId(null);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Report Another Incident
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 card-hover">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... (form fields for title, type, severity) ... */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Incident Title *
              </label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="Brief description of the incident"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  Incident Type *
                </label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="Theft">Theft</option>
                  <option value="Violence">Violence</option>
                  <option value="Intrusion">Intrusion</option>
                  <option value="Fire">Fire</option>
                  <option value="Medical">Medical Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Severity *
                </label>
                <select 
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Location *
              </label>
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  placeholder="e.g., 'Outside Phase 3 Hayatabad', 'University Town'"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
                
                <div className="map-container border border-slate-300">
                  <MapContainer
                    center={mapCenter} // Use state for center
                    zoom={13}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker
                      onLocationSelect={(latlng) => {
                        // FIXED: Update form state with coordinates
                        setFormData(prev => ({
                          ...prev,
                          coordinates: { lat: latlng.lat, lng: latlng.lng }
                        }));
                      }}
                      selectedLocation={formData.coordinates} // FIXED: Pass state
                    />
                  </MapContainer>
                </div>
                <p className="text-sm text-slate-600">
                  Click on the map to set the incident location or drag the marker to adjust.
                </p>
              </div>
            </div>

            {/* ... (form fields for phone, description, and submit button) ... */}
             <div>
              <label className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Contact Phone *
              </label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                placeholder="+92 300 1234567"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Description *
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={5}
                placeholder="Provide detailed information about the incident..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 border-2"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Incident Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ... (Important Note section) ... */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 card-hover">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Important Note</p>
            <p className="text-sm text-blue-800">
              After submitting, you'll receive a tracking ID to monitor the progress of your report. 
              No account is required for public reporting. Your information will be kept confidential.
              The incident will be visible to administrators and officers for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIncidentForm;