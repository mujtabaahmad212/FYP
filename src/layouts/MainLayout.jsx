import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

// Custom hook logic brought inside the component for simplicity
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); 

  return windowSize;
};

const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  
  const isMobile = width < 1024; // lg breakpoint

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentPage, setCurrentPage] = useState('');

  // Get page name from URL
  useEffect(() => {
    const path = location.pathname.substring(1).split('/')[0];
    setCurrentPage(path || 'dashboard'); // Default to dashboard
  }, [location]);

  // Handle navigation from Sidebar/Navbar
  const handleNavigation = (pageId) => {
    navigate(`/${pageId}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Adjust sidebar on resize
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar
        userRole={user?.role}
        currentPage={currentPage}
        setCurrentPage={handleNavigation}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        viewerIncidentId={localStorage.getItem('viewerIncidentId')} // Pass this for logic
      />
      
      {/* Content Area */}
      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : (sidebarOpen ? 'lg:ml-64' : 'lg:ml-0')}`}>
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={handleNavigation} 
          userRole={user?.role} 
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {/* Add padding-top to account for fixed 16-height navbar (h-16 = 4rem = 64px) + p-8 (2rem = 32px) = 96px */}
        <main className="p-4 sm:p-6 pt-20 sm:pt-24"> 
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;