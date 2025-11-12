// API base URL - update when backend available
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.token || null;
  } catch (e) {
    console.error('Error parsing user token', e);
    return null;
  }
};

const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ message: 'API call failed' }));
      throw new Error(errJson.message || `HTTP ${res.status}`);
    }
    return await res.json().catch(() => ({}));
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const publicApiCall = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ message: 'Public API call failed' }));
      throw new Error(errJson.message || `HTTP ${res.status}`);
    }
    return await res.json().catch(() => ({}));
  } catch (error) {
    console.error('Public API Error:', error);
    throw error;
  }
};

export const authAPI = {
  login: async (credentials) => {
    try {
      return await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    } catch (error) {
      console.warn('Using mock login fallback', error.message);
      const user = {
        id: Date.now(),
        email: credentials.email,
        role: credentials.role || 'admin',
        name: credentials.email.split('@')[0]
      };
      const token = `mock_token_${Date.now()}`;
      localStorage.setItem('user', JSON.stringify({ ...user, token }));
      return { user, token };
    }
  },
  register: (data) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  verifyToken: () => apiCall('/auth/verify')
};

export const incidentAPI = {
  getAll: async (filters = {}) => {
    try {
      const qs = new URLSearchParams(filters).toString();
      const endpoint = qs ? `/incidents?${qs}` : '/incidents';
      return await apiCall(endpoint);
    } catch (error) {
      console.warn('Returning fallback empty incidents', error.message);
      return { incidents: [] };
    }
  },

  getById: async (id) => {
    try {
      return await apiCall(`/incidents/${id}`);
    } catch (error) {
      console.warn('getById fallback null', error.message);
      return null;
    }
  },

  create: async (incidentData) => {
    try {
      return await apiCall('/incidents', { method: 'POST', body: JSON.stringify(incidentData) });
    } catch (error) {
      console.warn('create fallback to localStorage', error.message);
      const newIncident = { id: Date.now(), ...incidentData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem('incidents') || '[]');
      existing.push(newIncident);
      localStorage.setItem('incidents', JSON.stringify(existing));
      return { incident: newIncident };
    }
  },

  reportPublic: async (incidentData) => {
    try {
      return await publicApiCall('/incidents/public', { method: 'POST', body: JSON.stringify(incidentData) });
    } catch (error) {
      console.warn('reportPublic fallback to localStorage', error.message);
      const newIncident = {
        id: Date.now(),
        ...incidentData,
        status: 'open',
        assignedTo: 'Pending Assignment',
        reporter: 'Anonymous',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lat: incidentData.lat || (34.0151 + (Math.random() - 0.5) * 0.01),
        lng: incidentData.lng || (71.5249 + (Math.random() - 0.5) * 0.01)
      };
      const viewer = JSON.parse(localStorage.getItem('viewerIncidents') || '[]');
      viewer.push(newIncident);
      localStorage.setItem('viewerIncidents', JSON.stringify(viewer));
      localStorage.setItem('viewerIncidentId', newIncident.id.toString());
      const all = JSON.parse(localStorage.getItem('incidents') || '[]');
      all.push(newIncident);
      localStorage.setItem('incidents', JSON.stringify(all));
      return { incident: newIncident, trackingId: newIncident.id };
    }
  },

  getByTrackingId: async (trackingId) => {
    try {
      return await publicApiCall(`/incidents/track/${trackingId}`);
    } catch (error) {
      console.warn('getByTrackingId fallback localStorage', error.message);
      const viewer = JSON.parse(localStorage.getItem('viewerIncidents') || '[]');
      const found = viewer.find(i => i.id === parseInt(trackingId));
      if (found) return found;
      const all = JSON.parse(localStorage.getItem('incidents') || '[]');
      return all.find(i => i.id === parseInt(trackingId)) || null;
    }
  },

  update: async (id, data) => {
    try {
      return await apiCall(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (error) {
      console.warn('update fallback localStorage', error.message);
      const arr = JSON.parse(localStorage.getItem('incidents') || '[]');
      const idx = arr.findIndex(i => i.id === parseInt(id));
      if (idx !== -1) {
        arr[idx] = { ...arr[idx], ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem('incidents', JSON.stringify(arr));
        return { incident: arr[idx] };
      }
      throw new Error('Incident not found in localStorage');
    }
  },

  delete: async (id) => {
    try {
      return await apiCall(`/incidents/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('delete fallback localStorage', error.message);
      const arr = JSON.parse(localStorage.getItem('incidents') || '[]');
      const filtered = arr.filter(i => i.id !== parseInt(id));
      localStorage.setItem('incidents', JSON.stringify(filtered));
      return { success: true };
    }
  },

  updateStatus: async (id, status) => {
    try {
      return await apiCall(`/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    } catch (error) {
      console.warn('updateStatus fallback to update', error.message);
      return await incidentAPI.update(id, { status });
    }
  },

  assign: async (id, officerId) => {
    try {
      return await apiCall(`/incidents/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assignedTo: officerId }) });
    } catch (error) {
      console.warn('assign fallback to update', error.message);
      return await incidentAPI.update(id, { assignedTo: officerId });
    }
  }
};

export const analyticsAPI = {
  getDashboardStats: async () => {
    try {
      return await apiCall('/analytics/dashboard');
    } catch (error) {
      console.warn('analytics fallback generating mock stats', error.message);
      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      const total = incidents.length;
      const open = incidents.filter(i => i.status === 'open').length;
      const resolved = incidents.filter(i => i.status === 'resolved').length;
      const highPriority = incidents.filter(i => ['high', 'critical'].includes((i.severity || '').toLowerCase())).length;
      return { total, open, resolved, highPriority, weeklyTrend: [], byType: [], bySeverity: [], byLocation: [] };
    }
  },

  getIncidentTrends: async (period = 'week') => {
    try {
      return await apiCall(`/analytics/trends?period=${period}`);
    } catch (error) {
      console.warn('getIncidentTrends fallback', error.message);
      return { weekly: [], monthly: [] };
    }
  },

  getHotspots: async () => {
    try {
      return await apiCall('/analytics/hotspots');
    } catch (error) {
      console.warn('getHotspots fallback', error.message);
      return [];
    }
  },

  exportReport: async (params) => {
    try {
      return await apiCall('/analytics/export', { method: 'POST', body: JSON.stringify(params) });
    } catch (error) {
      console.warn('exportReport failed', error.message);
      throw error;
    }
  }
};

export const userAPI = {
  getProfile: () => apiCall('/user/profile'),
  updateProfile: (data) => apiCall('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data) => apiCall('/user/password', { method: 'PUT', body: JSON.stringify(data) }),
  getNotificationSettings: () => apiCall('/user/notifications'),
  updateNotificationSettings: (settings) => apiCall('/user/notifications', { method: 'PUT', body: JSON.stringify(settings) })
};

export default { auth: authAPI, incidents: incidentAPI, analytics: analyticsAPI, user: userAPI };
