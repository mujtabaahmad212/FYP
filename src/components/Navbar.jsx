import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, X, Shield, AlertTriangle, FileText, Settings, MapPin, TrendingUp, User, ChevronDown, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { logout, user, userRole } = useAuth();
  const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

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

  // Show toast notification when new incident arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotif = notifications;
      if (latestNotif.timestamp && Date.now() - latestNotif.timestamp.getTime() < 3000) {
        showToast(latestNotif);
      }
    }
  }, [notifications]);

  const showToast = (notif) => {
    const id = Date.now();
    const newToast = { id, ...notif };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
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

  const handleNotificationToggle = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen && unreadCount > 0) {
      markAsRead();
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
    <>
      <nav className="fixed top-0 right-0 left-0 bg-white/0 backdrop-blur-lg border-b border-white z-50 shadow-lg">
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
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
                SIMS
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
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={handleNotificationToggle}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition" 
                title="Notifications"
              >
                <Bell className="w-6 h-6 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border-2 border-slate-200 max-h-[500px] overflow-hidden flex flex-col animate-in">
                  {/* Header */}
                  <div className="p-4 border-b-2 border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications ({notifications.length})
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div
                          key={idx}
                          className="p-4 border-b border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                          onClick={() => {
                            navigate('/incidents');
                            setNotificationOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notif.severity === 'critical' ? 'bg-red-100' :
                              notif.severity === 'high' ? 'bg-orange-100' :
                              notif.severity === 'medium' ? 'bg-yellow-100' :
                              'bg-green-100'
                            }`}>
                              <AlertTriangle className={`w-4 h-4 ${
                                notif.severity === 'critical' ? 'text-red-600' :
                                notif.severity === 'high' ? 'text-orange-600' :
                                notif.severity === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">
                                🚨 {notif.title || 'New Incident'}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                                <MapPin className="w-3 h-3" />
                                {notif.location || 'Unknown'}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  notif.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                  notif.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                  notif.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {notif.severity || 'medium'}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Just now
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-white rounded-xl shadow-2xl border-2 border-slate-200 p-4 w-80 animate-in pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                toast.severity === 'critical' ? 'bg-red-100' :
                toast.severity === 'high' ? 'bg-orange-100' :
                toast.severity === 'medium' ? 'bg-yellow-100' :
                'bg-green-100'
              }`}>
                <Bell className={`w-5 h-5 ${
                  toast.severity === 'critical' ? 'text-red-600' :
                  toast.severity === 'high' ? 'text-orange-600' :
                  toast.severity === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  🚨 New Incident!
                </h4>
                <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                  {toast.title || 'Untitled'}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    toast.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    toast.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    toast.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {toast.severity || 'medium'}
                  </span>
                  <span className="text-xs text-slate-500">{toast.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Navbar;
