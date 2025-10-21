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

// Generic API call function
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
};

// Incident APIs
export const incidentAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiCall(`/incidents?${queryString}`);
  },
  
  getById: (id) => apiCall(`/incidents/${id}`),
  
  create: (incidentData) => apiCall('/incidents', {
    method: 'POST',
    body: JSON.stringify(incidentData),
  }),
  
  update: (id, incidentData) => apiCall(`/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(incidentData),
  }),
  
  delete: (id) => apiCall(`/incidents/${id}`, { method: 'DELETE' }),
  
  uploadEvidence: (id, formData) => apiCall(`/incidents/${id}/evidence`, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  }),
};

// Analytics/Reports APIs
export const analyticsAPI = {
  getDashboardStats: () => apiCall('/analytics/dashboard'),
  
  getIncidentTrends: (period) => apiCall(`/analytics/trends?period=${period}`),
  
  getHotspots: () => apiCall('/analytics/hotspots'),
  
  exportReport: (params) => apiCall('/analytics/export', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
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