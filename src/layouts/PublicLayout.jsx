import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Public Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/public" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              SecureWatch
            </h1>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/public" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2">
              Report & Track
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-lg"
            >
              Officer Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="container mx-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;