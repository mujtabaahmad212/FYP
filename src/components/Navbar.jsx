import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { Bell, LogOut, Shield, AlertTriangle, FileText, Settings, MapPin, TrendingUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, user, userRole } = useAuth(); // Get userRole from context
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation(); // Get current page location

  // Navigation items based on role
  const getMenuItems = () => {
    if (userRole === 'admin' || userRole === 'officer') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, path: '/dashboard' },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, path: '/incidents' },
        { id: 'map', label: 'Live Map', icon: MapPin, path: '/map' },
        { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
        ...(userRole === 'admin' ? [{ id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }] : [])
      ];
    }
    // No menu items for viewers in the admin panel
    return [];
  };

  const menuItems = getMenuItems();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 right-0 left-0 bg-white/95 backdrop-blur-lg border-b border-slate-200/50 z-50 shadow-sm">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center gap-4 sm:gap-8 flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hidden sm:block">
              SecureWatch
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // Check if current path starts with the item's path
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path} // Use Link's "to" prop for navigation
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Role Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
            <div className={`w-2 h-2 rounded-full ${
              userRole === 'admin' 
                ? 'bg-blue-500' 
                : userRole === 'officer' 
                  ? 'bg-green-500' 
                  : 'bg-purple-500'
            } animate-pulse`}></div>
            <span className="text-sm font-medium text-slate-700 capitalize">
              {userRole || 'Guest'}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group">
            <Bell className="w-6 h-6 text-slate-700 group-hover:text-blue-600 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-glow ring-2 ring-white"></span>
          </button>

          <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

          {/* Desktop Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || userRole?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
                <div className="p-3 border-b border-slate-200">
                  <p className="font-semibold text-slate-900 text-sm capitalize">{userRole || 'Guest'}</p>
                  <p className="text-xs text-slate-600 truncate">{user?.email || 'No email'}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
                >
                  <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - REMOVED */}
          {/* The mobile menu dropdown is also REMOVED */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;