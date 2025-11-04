import React from 'react';
import ReportIncidentForm from './ReportIncidentForm';
import TrackIncident from '../components/TrackIncident';

const PublicPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-8">Security Incident Reporting</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Report a New Incident</h2>
          <ReportIncidentForm />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Track Your Incident</h2>
          <TrackIncident />
        </div>
      </div>
    </div>
  );
};

export default PublicPage;