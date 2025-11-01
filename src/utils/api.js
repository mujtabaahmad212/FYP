// API base URL - update this when you have a backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
  return null;
};

// Generic API call function with error handling
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API call failed' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Public API call (no auth required) - for viewer incident reporting
const publicApiCall = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API call failed' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Public API Error:', error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return response;
    } catch (error) {
      // Fallback for development - use mock login
      console.warn('Backend not available, using mock login:', error.message);
      return {
        user: {
          id: Date.now(),
          email: credentials.email,
          role: credentials.role || 'admin',
          name: credentials.email.split('@')[0],
        },
        token: `mock_token_${Date.now()}`,
      };
    }
  },
  
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  
  verifyToken: () => apiCall('/auth/verify'),
};

// Incident APIs
export const incidentAPI = {
  // Get all incidents with optional filters
  getAll: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = queryString ? `/incidents?${queryString}` : '/incidents';
      return await apiCall(endpoint);
    } catch (error) {
      console.warn('Backend not available, using mock data:', error.message);
      // Return mock data for development
      return {
        incidents: [],
        total: 0,
        page: 1,
        limit: 100,
      };
    }
  },
  
  // Get incident by ID
  getById: async (id) => {
    try {
      return await apiCall(`/incidents/${id}`);
    } catch (error) {
      console.warn('Backend not available, returning null:', error.message);
      return null;
    }
  },
  
  // Create incident (for authenticated users)
  create: async (incidentData) => {
    try {
      return await apiCall('/incidents', {
        method: 'POST',
        body: JSON.stringify(incidentData),
      });
    } catch (error) {
      console.warn('Backend not available, using localStorage fallback:', error.message);
      // Fallback to localStorage for development
      const newIncident = {
        id: Date.now(),
        ...incidentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('incidents') || '[]');
      existing.push(newIncident);
      localStorage.setItem('incidents', JSON.stringify(existing));
      return { incident: newIncident };
    }
  },
  
  // Public incident report (for viewers - no auth required)
  reportPublic: async (incidentData) => {
    try {
      return await publicApiCall('/incidents/public', {
        method: 'POST',
        body: JSON.stringify(incidentData),
      });
    } catch (error) {
      console.warn('Backend not available, using localStorage fallback:', error.message);
      // Fallback to localStorage for development
      const newIncident = {
        id: Date.now(),
        ...incidentData,
        status: 'open',
        assignedTo: 'Pending Assignment',
        reporter: 'Anonymous Reporter',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lat: incidentData.lat || 34.0151 + (Math.random() - 0.5) * 0.01,
        lng: incidentData.lng || 71.5249 + (Math.random() - 0.5) * 0.01,
      };
      
      // Store in both viewer incidents and main incidents
      const viewerIncidents = JSON.parse(localStorage.getItem('viewerIncidents') || '[]');
      viewerIncidents.push(newIncident);
      localStorage.setItem('viewerIncidents', JSON.stringify(viewerIncidents));
      localStorage.setItem('viewerIncidentId', newIncident.id.toString());
      
      const allIncidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      allIncidents.push(newIncident);
      localStorage.setItem('incidents', JSON.stringify(allIncidents));
      
      return { incident: newIncident, trackingId: newIncident.id };
    }
  },
  
  // Get incident by tracking ID (for viewers)
  getByTrackingId: async (trackingId) => {
    try {
      return await publicApiCall(`/incidents/track/${trackingId}`);
    } catch (error) {
      console.warn('Backend not available, using localStorage fallback:', error.message);
      // Fallback to localStorage
      const viewerIncidents = JSON.parse(localStorage.getItem('viewerIncidents') || '[]');
      const incident = viewerIncidents.find(inc => inc.id === parseInt(trackingId));
      if (!incident) {
        const allIncidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        return allIncidents.find(inc => inc.id === parseInt(trackingId)) || null;
      }
      return incident;
    }
  },
  
  // Update incident
  update: async (id, incidentData) => {
    try {
      return await apiCall(`/incidents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(incidentData),
      });
    } catch (error) {
      console.warn('Backend not available, using localStorage fallback:', error.message);
      // Fallback to localStorage
      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      const index = incidents.findIndex(inc => inc.id === parseInt(id));
      if (index !== -1) {
        incidents[index] = { ...incidents[index], ...incidentData, updatedAt: new Date().toISOString() };
        localStorage.setItem('incidents', JSON.stringify(incidents));
        return { incident: incidents[index] };
      }
      throw new Error('Incident not found');
    }
  },
  
  // Delete incident
  delete: async (id) => {
    try {
      return await apiCall(`/incidents/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('Backend not available, using localStorage fallback:', error.message);
      // Fallback to localStorage
      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      const filtered = incidents.filter(inc => inc.id !== parseInt(id));
      localStorage.setItem('incidents', JSON.stringify(filtered));
      return { success: true };
    }
  },
  
  // Update incident status
  updateStatus: async (id, status) => {
    try {
      return await apiCall(`/incidents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.warn('Backend not available, using localStorage fallback:', error.message);
      return await incidentAPI.update(id, { status });
    }
  },
  
  // Assign incident to officer
  assign: async (id, officerId) => {
    try {
      return await apiCall(`/incidents/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedTo: officerId }),
      });
    } catch (error) {
      console.warn('Backend not available, using localStorage fallback:', error.message);
      return await incidentAPI.update(id, { assignedTo: officerId });
    }
  },
};

// Analytics/Reports APIs
export const analyticsAPI = {
  getDashboardStats: async () => {
    try {
      return await apiCall('/analytics/dashboard');
    } catch (error) {
      console.warn('Backend not available, using mock stats:', error.message);
      // Return mock stats
      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      const total = incidents.length;
      const open = incidents.filter(i => i.status === 'open').length;
      const resolved = incidents.filter(i => i.status === 'resolved').length;
      const highPriority = incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length;
      
      return {
        total,
        open,
        resolved,
        highPriority,
        weeklyTrend: [],
        byType: [],
        bySeverity: [],
      };
    }
  },
  
  getIncidentTrends: async (period = 'week') => {
    try {
      return await apiCall(`/analytics/trends?period=${period}`);
    } catch (error) {
      console.warn('Backend not available, using mock trends:', error.message);
      return {
        weekly: [],
        monthly: [],
      };
    }
  },
  
  getHotspots: async () => {
    try {
      return await apiCall('/analytics/hotspots');
    } catch (error) {
      console.warn('Backend not available, using mock hotspots:', error.message);
      return [];
    }
  },
  
  exportReport: async (params) => {
    try {
      return await apiCall('/analytics/export', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (error) {
      console.warn('Backend not available:', error.message);
      throw error;
    }
  },
};

// User/Settings APIs
export const userAPI = {
  getProfile: () => apiCall('/user/profile'),
  
  updateProfile: (profileData) => apiCall('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  updatePassword: (passwordData) => apiCall('/user/password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),
  
  getNotificationSettings: () => apiCall('/user/notifications'),
  
  updateNotificationSettings: (settings) => apiCall('/user/notifications', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
};

export default {
  auth: authAPI,
  incidents: incidentAPI,
  analytics: analyticsAPI,
  user: userAPI,
};
