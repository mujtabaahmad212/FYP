import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { incidentAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const IncidentsContext = createContext();

export const useIncidents = () => {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error('useIncidents must be used within IncidentsProvider');
  }
  return context;
};

export const IncidentsProvider = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch incidents from backend
  const fetchIncidents = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await incidentAPI.getAll(filters);
      const incidentsList = response.incidents || response.data || response || [];
      setIncidents(Array.isArray(incidentsList) ? incidentsList : []);
      setLastUpdated(new Date());
      
      // Also update localStorage as backup
      if (Array.isArray(incidentsList)) {
        localStorage.setItem('incidents', JSON.stringify(incidentsList));
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError(err.message);
      
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('incidents');
        if (stored) {
          const storedIncidents = JSON.parse(stored);
          setIncidents(Array.isArray(storedIncidents) ? storedIncidents : []);
        }
      } catch (parseError) {
        console.error('Error parsing stored incidents:', parseError);
        setIncidents([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new incident
  const createIncident = useCallback(async (incidentData) => {
    try {
      setLoading(true);
      const response = await incidentAPI.create(incidentData);
      const newIncident = response.incident || response.data || response;
      
      // Add to local state
      setIncidents(prev => [...prev, newIncident]);
      
      // Refresh list
      await fetchIncidents();
      
      return newIncident;
    } catch (err) {
      console.error('Error creating incident:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchIncidents]);

  // Public incident report (for viewers)
  const reportPublicIncident = useCallback(async (incidentData) => {
    try {
      setLoading(true);
      const response = await incidentAPI.reportPublic(incidentData);
      const newIncident = response.incident || response.data || response;
      
      // Add to local state so it appears immediately
      setIncidents(prev => [...prev, newIncident]);
      
      // Store tracking ID
      if (response.trackingId || newIncident.id) {
        localStorage.setItem('viewerIncidentId', (response.trackingId || newIncident.id).toString());
      }
      
      return { incident: newIncident, trackingId: response.trackingId || newIncident.id };
    } catch (err) {
      console.error('Error reporting incident:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update incident
  const updateIncident = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const response = await incidentAPI.update(id, updates);
      const updatedIncident = response.incident || response.data || response;
      
      // Update local state
      setIncidents(prev => 
        prev.map(inc => inc.id === parseInt(id) ? { ...inc, ...updatedIncident } : inc)
      );
      
      return updatedIncident;
    } catch (err) {
      console.error('Error updating incident:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update incident status
  const updateIncidentStatus = useCallback(async (id, status) => {
    try {
      const updated = await incidentAPI.updateStatus(id, status);
      await updateIncident(id, { status });
      return updated;
    } catch (err) {
      console.error('Error updating incident status:', err);
      throw err;
    }
  }, [updateIncident]);

  // Delete incident
  const deleteIncident = useCallback(async (id) => {
    try {
      setLoading(true);
      await incidentAPI.delete(id);
      
      // Remove from local state
      setIncidents(prev => prev.filter(inc => inc.id !== parseInt(id)));
    } catch (err) {
      console.error('Error deleting incident:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get incident by ID
  const getIncidentById = useCallback(async (id) => {
    try {
      const incident = await incidentAPI.getById(id);
      return incident;
    } catch (err) {
      console.error('Error fetching incident:', err);
      // Fallback to local state
      return incidents.find(inc => inc.id === parseInt(id)) || null;
    }
  }, [incidents]);

  // Get incident by tracking ID (for viewers)
  const getIncidentByTrackingId = useCallback(async (trackingId) => {
    try {
      const incident = await incidentAPI.getByTrackingId(trackingId);
      return incident;
    } catch (err) {
      console.error('Error fetching incident by tracking ID:', err);
      // Fallback to localStorage
      try {
        const viewerIncidents = JSON.parse(localStorage.getItem('viewerIncidents') || '[]');
        const incident = viewerIncidents.find(inc => inc.id === parseInt(trackingId));
        if (!incident) {
          const allIncidents = JSON.parse(localStorage.getItem('incidents') || '[]');
          return allIncidents.find(inc => inc.id === parseInt(trackingId)) || null;
        }
        return incident;
      } catch (parseError) {
        return null;
      }
    }
  }, []);

  // Auto-refresh incidents for authenticated users
  useEffect(() => {
    if (isAuthenticated && (userRole === 'admin' || userRole === 'officer')) {
      fetchIncidents();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchIncidents();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userRole, fetchIncidents]);

  // Load from localStorage on mount as fallback
  useEffect(() => {
    if (incidents.length === 0) {
      try {
        const stored = localStorage.getItem('incidents');
        if (stored) {
          const storedIncidents = JSON.parse(stored);
          if (Array.isArray(storedIncidents) && storedIncidents.length > 0) {
            setIncidents(storedIncidents);
          }
        }
      } catch (err) {
        console.error('Error loading incidents from localStorage:', err);
      }
    }
  }, []);

  const value = {
    incidents,
    loading,
    error,
    lastUpdated,
    fetchIncidents,
    createIncident,
    reportPublicIncident,
    updateIncident,
    updateIncidentStatus,
    deleteIncident,
    getIncidentById,
    getIncidentByTrackingId,
    refreshIncidents: fetchIncidents,
  };

  return (
    <IncidentsContext.Provider value={value}>
      {children}
    </IncidentsContext.Provider>
  );
};

