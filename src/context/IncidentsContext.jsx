import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const IncidentsContext = createContext();

export const useIncidents = () => {
  const context = useContext(IncidentsContext);
  if (!context) throw new Error('useIncidents must be used within IncidentsProvider');
  return context;
};

export const IncidentsProvider = ({ children }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time Firestore listener
  useEffect(() => {
    setLoading(true);
    const incidentsRef = collection(db, 'incidents');
    const q = query(incidentsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Create incident (for both staff/public)
  const createIncident = useCallback(async (incidentData) => {
    setLoading(true);
    try {
      const incidentsRef = collection(db, 'incidents');
      const docRef = await addDoc(incidentsRef, { ...incidentData, createdAt: Date.now() });
      return { id: docRef.id, ...incidentData, createdAt: Date.now() };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  // For public reporting (same function)
  const reportPublicIncident = createIncident;

  // Get one by id (for tracking)
  const getIncidentById = useCallback(async (id) => {
    try {
      const ref = doc(db, 'incidents', id);
      const docSnap = await getDoc(ref);
      return docSnap.exists()
        ? { id: docSnap.id, ...docSnap.data() }
        : null;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);
  const getIncidentByTrackingId = getIncidentById;

  // Update
  const updateIncident = useCallback(async (id, updates) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'incidents', id);
      await updateDoc(docRef, updates);
      return getIncidentById(id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getIncidentById]);
  const updateIncidentStatus = useCallback(async (id, status) => {
    return updateIncident(id, { status });
  }, [updateIncident]);

  // Delete
  const deleteIncident = useCallback(async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'incidents', id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual re-fetch (not needed for realtime, but useful if called elsewhere)
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <IncidentsContext.Provider value={{
      incidents,
      loading,
      error,
      fetchIncidents,
      createIncident,
      reportPublicIncident,
      updateIncident,
      updateIncidentStatus,
      deleteIncident,
      getIncidentById,
      getIncidentByTrackingId
    }}>
      {children}
    </IncidentsContext.Provider>
  );
};
