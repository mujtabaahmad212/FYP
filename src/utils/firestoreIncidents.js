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

// CREATE incident
export const createIncident = async (incidentData) => {
  const incidentsRef = collection(db, 'incidents');
  const docRef = await addDoc(incidentsRef, {
    ...incidentData,
    createdAt: Date.now()
  });
  return { id: docRef.id, ...incidentData, createdAt: Date.now() };
};

// READ ALL incidents (call this as needed)
export const fetchIncidents = async () => {
  const incidentsRef = collection(db, 'incidents');
  const q = query(incidentsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// REAL-TIME LISTEN to all incidents
export const watchIncidents = (onUpdate) => {
  const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    onUpdate(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

// READ single
export const fetchIncidentById = async (id) => {
  const docRef = doc(db, 'incidents', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// UPDATE
export const updateIncident = async (id, updates) => {
  const docRef = doc(db, 'incidents', id);
  await updateDoc(docRef, { ...updates });
  return fetchIncidentById(id);
};

// DELETE
export const deleteIncident = async (id) => {
  return await deleteDoc(doc(db, 'incidents', id));
};
