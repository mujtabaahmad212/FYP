import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from "./components/Navbar";

// Components
import IncidentList from './components/IncidentList'; // Typo is still here, make sure to rename the file!
import MapView from "./components/MapView";

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ReportIncidentForm from './pages/ReportIncidentForm';
import TrackIncident from './components/TrackIncident';
// Assuming you have this file from the first batch of code
import PublicPage from './pages/PublicPage'; 
import Unauthorized from './pages/Unauthorized'; // Added this import

// Helper component for protected routes
const ProtectedLayout = () => {
  const { isAuthenticated, userRole } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect viewers away from admin panel
  if (userRole === 'viewer') {
    return <Navigate to="/report" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Navbar /> {/* No props needed anymore */}
      <main className="pt-20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet /> {/* Renders the nested child route */}
        </div>
      </main>
    </div>
  );
};

// Helper component for public-facing pages
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* You can add a simple public navbar here if you want */}
      <main className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<PublicLayout />}>
        <Route path="/report" element={<ReportIncidentForm />} />
        <Route path="/track" element={<TrackIncident />} />
        {/* Fallback public page */}
        <Route path="/public" element={
            isAuthenticated && userRole !== 'viewer' 
            ? <Navigate to="/dashboard" /> 
            : <PublicPage />
          } 
        />
      </Route>

      {/* Protected Admin/Officer Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Pass userRole prop here */}
        <Route path="/incidents" element={<IncidentList userRole={userRole} />} /> 
        <Route path="/map" element={<MapView />} />
        <Route path="/reports" element={<Reports />} />
        
        {/* Admin-only settings route */}
        <Route 
          path="/settings" 
          element={userRole === 'admin' ? <Settings /> : <Navigate to="/unauthorized" />} 
        />
      </Route>

      {/* Default Redirects */}
      <Route 
        path="/" 
        element={
          !isAuthenticated ? <Navigate to="/public" /> 
          : userRole === 'viewer' ? <Navigate to="/report" />
          : <Navigate to="/dashboard" />
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;