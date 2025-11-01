import React from 'react';
import { Shield, AlertTriangle, FileText, Settings, MapPin, TrendingUp, Plus, Eye, Users, X } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage, userRole, viewerIncidentId, isMobile }) => {

  const menuItems = userRole !== 'viewer' ? [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: FileText },
  ] : [
    { id: 'report-incident', label: 'Report Incident', icon: Plus },
    ...(viewerIncidentId ? [{ id: 'track-incident', label: 'Track My Report', icon: Eye }] : [])
  ];

  if (userRole === 'admin') {
    menuItems.push({ id: 'settings', label: 'Settings', icon: Settings });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-50 ${
          sidebarOpen 
            ? 'w-64 translate-x-0' 
            : isMobile 
              ? '-translate-x-full' 
              : 'w-0 -translate-x-full'
        } overflow-hidden shadow-2xl`}
      >
        <div className="p-4 sm:p-6 h-full flex flex-col">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                SecureWatch
              </h1>
            </div>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/50'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="mt-auto pt-4 border-t border-slate-700">
            <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  userRole === 'admin' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : userRole === 'officer' 
                      ? 'bg-gradient-to-br from-green-500 to-green-600' 
                      : 'bg-gradient-to-br from-purple-500 to-purple-600'
                } shadow-lg`}>
                  {userRole === 'admin' ? (
                    <Shield className="w-5 h-5" />
                  ) : userRole === 'officer' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold capitalize text-sm truncate">
                    {userRole || 'Guest'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {userRole === 'admin' 
                      ? 'Administrator' 
                      : userRole === 'officer' 
                        ? 'Security Officer' 
                        : 'Public User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
