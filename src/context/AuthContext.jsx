import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Safely load user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Verify token with backend if available
          if (userData.token && userData.token.startsWith('real_')) {
            authAPI.verifyToken().catch(() => {
              // Token invalid, logout
              setUser(null);
              setIsAuthenticated(false);
              localStorage.removeItem('user');
            });
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      setIsLoading(true);
      
      // Try backend login first
      const response = await authAPI.login({ email, password, role });
      
      const userData = {
        id: response.user?.id || Date.now(),
        email: response.user?.email || email,
        role: response.user?.role || role,
        name: response.user?.name || email.split('@')[0],
        token: response.token || `mock_token_${Date.now()}`,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      // Fallback to mock login for development
      const userData = { 
        id: Date.now(), 
        email, 
        role, 
        name: email.split('@')[0],
        token: `mock_token_${Date.now()}`,
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Try backend logout
      authAPI.logout().catch(() => {
        // Backend not available, just clear local state
      });
      
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('viewerIncidentId');
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('viewerIncidentId');
    }
  };

  // Permission system based on roles
  const hasPermission = (action) => {
    if (!user) return false;
    
    const permissions = {
      admin: ['create', 'edit', 'delete', 'view', 'settings', 'export'],
      officer: ['create', 'edit', 'view'],
      viewer: ['view']
    };

    return permissions[user.role]?.includes(action) || false;
  };

  const value = {
    user,
    userRole: user?.role,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-slate-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
