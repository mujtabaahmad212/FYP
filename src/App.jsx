import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from "./components/Navbar";
import IncidentList from "./components/IncedintList";
import MapView from "./components/MapView";

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ReportIncidentForm from './pages/ReportIncidentForm';
import TrackIncident from './components/TrackIncident';

const App = () => {
  try {
    const { isAuthenticated, user, isLoading } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isMobile, setIsMobile] = useState(() => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 768;
      }
      return false;
    });

    // Initialize page based on user role
    useEffect(() => {
      if (isLoading) return;
      
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData?.role === 'viewer') {
            setCurrentPage('report-incident');
          }
        }
      } catch (e) {
        console.error('Error initializing page:', e);
      }
    }, [isLoading]);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update page when user role changes
    useEffect(() => {
      if (!user || isLoading) return;
      
      if (user.role === 'viewer' && ['dashboard', 'incidents', 'map', 'reports'].includes(currentPage)) {
        setCurrentPage('report-incident');
      } else if (user.role !== 'viewer' && ['report-incident', 'track-incident'].includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    }, [user, isLoading, currentPage]);

    // Show loading while auth is initializing
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
            <p className="text-slate-600">Loading application...</p>
          </div>
        </div>
      );
    }

    // Show login if not authenticated
    if (!isAuthenticated) {
      return <Login />;
    }

    const userRole = user?.role || null;

    // Render page content - always render something
    const renderPage = () => {
      // For viewers
      if (userRole === 'viewer') {
        if (currentPage === 'report-incident') return <ReportIncidentForm />;
        if (currentPage === 'track-incident') return <TrackIncident />;
        return <ReportIncidentForm />;
      }

      // For admin/officer
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'incidents':
          return <IncidentList userRole={userRole} />;
        case 'map':
          return <MapView />;
        case 'reports':
          return <Reports />;
        case 'settings':
          return userRole === 'admin' ? <Settings /> : <Dashboard />;
        default:
          return <Dashboard />;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Navbar 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          userRole={userRole}
          isMobile={isMobile}
        />
        
        <main className="pt-16 p-4 sm:p-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-slate-200 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Error</h2>
          <p className="text-slate-600 mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default App;
