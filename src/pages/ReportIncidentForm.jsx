import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidents } from '../context/IncidentsContext';
import { AlertTriangle, MapPin, FileText, AlertCircle, Loader, CheckCircle, ArrowLeft } from 'lucide-react';

const ReportIncidentForm = () => {
  const { reportPublicIncident } = useIncidents();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Other',
    severity: 'medium',
    lat: '',
    lng: '',
    reporterName: '',
    reporterPhone: '',
    reporterEmail: ''
  });

  const incidentTypes = ['Theft', 'Violence', 'Intrusion', 'Fire', 'Medical', 'Suspicious Activity', 'Property Damage', 'Other'];
  const severityLevels = [
    { value: 'low', label: 'Low', color: 'from-green-500 to-green-600' },
    { value: 'medium', label: 'Medium', color: 'from-yellow-500 to-yellow-600' },
    { value: 'high', label: 'High', color: 'from-orange-500 to-orange-600' },
    { value: 'critical', label: 'Critical', color: 'from-red-500 to-red-600' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // FIXED handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!form.title.trim()) {
        setError('Incident title is required');
        setLoading(false);
        return;
      }
      if (!form.description.trim()) {
        setError('Description is required');
        setLoading(false);
        return;
      }
      if (!form.location.trim()) {
        setError('Location is required');
        setLoading(false);
        return;
      }

      const res = await reportPublicIncident(form);

      // --- Robust trackingId extraction: --- //
      // Firestore create incident may return an object with "id" (not "incident.id")
      // and your API wrapper may return various shapes:
      let trackingId = '';
      if (typeof res === 'object') {
        trackingId = res?.trackingId
                  || res?.incident?.id
                  || res?.inc?.id
                  || res?.id
                  || '';
      }
      if (!trackingId) {
        setError("Incident submitted, but no tracking ID returned.");
        setLoading(false);
        return;
      }
      setTrackingId(trackingId);
      setSuccess(true);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressSteps = [
    { number: 1, label: 'Incident Details', icon: AlertTriangle },
    { number: 2, label: 'Location & Contact', icon: MapPin },
    { number: 3, label: 'Confirmation', icon: CheckCircle }
  ];

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Report an Incident</h1>
          <p className="text-slate-600 text-lg">Help us respond faster by providing detailed information</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {progressSteps.map((s, idx) => {
              const StepIcon = s.icon;
              const isActive = step >= s.number;
              const isCurrent = step === s.number;
              return (
                <div key={s.number} className="flex items-center flex-1">
                  {/* Step Indicator */}
                  <div className={`relative flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all duration-300 ${
                    isCurrent ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg scale-110' :
                    isActive ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {isActive && s.number !== step ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                  </div>

                  {/* Connector Line */}
                  {idx < progressSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                      isActive ? 'bg-green-500' : 'bg-slate-300'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-sm font-medium">
            {progressSteps.map(s => (
              <span key={s.number} className={`${step >= s.number ? 'text-blue-600' : 'text-slate-500'}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="card animate-in">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Incident Details */}
              {step === 1 && (
                <div className="space-y-6 animate-in">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      <AlertTriangle className="w-4 h-4 inline mr-2 text-red-600" />
                      Incident Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="E.g., Unauthorized Entry, Fire Alarm, etc."
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      <FileText className="w-4 h-4 inline mr-2 text-blue-600" />
                      Detailed Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Provide detailed information about the incident (what happened, when, who was involved, etc.)"
                      rows="6"
                      className="input-field resize-none"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Incident Type</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="input-field"
                    >
                      {incidentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-4">Severity Level *</label>
                    <div className="grid grid-cols-4 gap-3">
                      {severityLevels.map(level => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, severity: level.value }))}
                          className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                            form.severity === level.value
                              ? `bg-gradient-to-br ${level.color} text-white shadow-lg scale-105`
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary w-full"
                  >
                    Continue to Location
                  </button>
                </div>
              )}

              {/* Step 2: Location & Contact */}
              {step === 2 && (
                <div className="space-y-6 animate-in">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      <MapPin className="w-4 h-4 inline mr-2 text-green-600" />
                      Location (Address/Area) *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="E.g., Building A, Room 105, Main Gate"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">Latitude (Optional)</label>
                      <input
                        type="number"
                        name="lat"
                        value={form.lat}
                        onChange={handleChange}
                        placeholder="34.0151"
                        step="0.0001"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">Longitude (Optional)</label>
                      <input
                        type="number"
                        name="lng"
                        value={form.lng}
                        onChange={handleChange}
                        placeholder="71.5249"
                        step="0.0001"
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Your Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Name (Optional)</label>
                        <input
                          type="text"
                          name="reporterName"
                          value={form.reporterName}
                          onChange={handleChange}
                          placeholder="Your name"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          name="reporterPhone"
                          value={form.reporterPhone}
                          onChange={handleChange}
                          placeholder="+92 300 1234567"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Email (Optional)</label>
                        <input
                          type="email"
                          name="reporterEmail"
                          value={form.reporterEmail}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Report'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Success Step */
            <div className="text-center py-12 animate-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg mb-6 animate-bounce-subtle">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Report Submitted Successfully!</h2>
              <p className="text-slate-600 text-lg mb-6">Thank you for reporting this incident. Our team will respond shortly.</p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <p className="text-sm text-slate-600 mb-2">Your Tracking ID:</p>
                <p className="text-3xl font-bold text-blue-600 font-mono mb-4">{trackingId}</p>
                <p className="text-xs text-slate-600">Save this ID to track your report status</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/track')}
                  className="btn-primary"
                >
                  Track Your Report
                </button>
                <button
                  onClick={() => navigate('/viewer')}
                  className="btn-secondary"
                >
                  Back Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportIncidentForm;
