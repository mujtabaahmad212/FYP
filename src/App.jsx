import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IncidentsProvider } from './context/IncidentsContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import MapView from './components/MapView';
import IncidentList from './components/IncdentList';
import ReportIncidentForm from './pages/ReportIncidentForm';
import ViewerLanding from './pages/ViewerLanding';
import TrackIncident from './components/TrackIncident';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const AppRoutes = () => (
<Routes>
{/* Public Routes */}
<Route path="/login" element={<Login />} />
<Route path="/" element={<Navigate to="/viewer" replace />} />
<Route path="/unauthorized" element={<Unauthorized />} />
<Route path="/viewer" element={<ViewerLanding />} />
<Route path="/report-incident" element={<ReportIncidentForm />} />
<Route path="/track" element={<TrackIncident />} />{/* Protected Routes for authenticated users */}
<Route
  element={
    <ProtectedRoute allowedRoles={['admin', 'officer', 'viewer']}>
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/incidents" element={<IncidentList />} />
  <Route path="/map" element={<MapView />} />
  <Route path="/reports" element={
    <ProtectedRoute allowedRoles={['admin', 'officer']}>
      <Reports />
    </ProtectedRoute>
  } />
  <Route path="/settings" element={
    <ProtectedRoute allowedRoles={['admin']}>
      <Settings />
    </ProtectedRoute>
  } />
</Route>

{/* Catch all - redirect to viewer */}
<Route path="*" element={<Navigate to="/viewer" replace />} />
</Routes> );
export default function App() {
return (
<ErrorBoundary>
<BrowserRouter>
<AuthProvider>
<NotificationProvider>
<SettingsProvider>
<IncidentsProvider>
<AppRoutes />
</IncidentsProvider>
</SettingsProvider>
</NotificationProvider>
</AuthProvider>
</BrowserRouter>
</ErrorBoundary>
);
}