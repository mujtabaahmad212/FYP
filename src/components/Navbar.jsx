import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, X, Shield, AlertTriangle, FileText, Settings, MapPin, TrendingUp, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { logout, user, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentPage = location.pathname.substring(1) || 'dashboard';

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, roles: ['admin', 'officer', 'viewer'] },
      { id: 'incidents', label: 'Incidents', icon: AlertTriangle, roles: ['admin', 'officer', 'viewer'] },
      { id: 'map', label: 'Live Map', icon: MapPin, roles: ['admin', 'officer', 'viewer'] },
      { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'officer'] },
      { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] }
    ];

    return baseItems.filter(item => item.roles.includes(userRole));
  };

  const menuItems = getMenuItems();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (pageId) => {
    navigate(`/${pageId}`);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'from-blue-500 to-blue-600';
      case 'officer': return 'from-green-500 to-green-600';
      case 'viewer': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <nav className="fixed top-0 right-0 left-0 bg-white/0 backdrop-blur-lg border-b border-white z-50 shadow-lg">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto ">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4 sm:gap-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hidden sm:block">
              SecureWatch
            </h1>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Role Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getRoleBadgeColor(userRole)} text-white shadow`}>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-medium capitalize">{userRole || 'Guest'}</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition" title="Notifications">
            <Bell className="w-6 h-6 text-slate-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
          </button>

          {/* User Menu (Desktop) */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <p className="font-semibold text-slate-900">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-slate-600 truncate">{user?.email || 'No email'}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleBadgeColor(userRole)} text-white`}>
                    {userRole}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-2 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Mobile User Info */}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <div className="px-4 py-3 bg-slate-50 rounded-xl mb-2">
                <p className="font-semibold text-slate-900">{user?.displayName || 'User'}</p>
                <p className="text-xs text-slate-600 truncate">{user?.email || 'No email'}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleBadgeColor(userRole)} text-white`}>
                  {userRole}
                </span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
