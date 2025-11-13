import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizYIGGS47OihTQ0OTqXh8LhuHgU2jdXxzn4vBSh+zPDal0EMFmS66+mjTxELTKPh8LhuHgU1jNXyzoAvBSl/zPDal0IMFmS66+mjTxELTKPh8LhuHgU1jNTyzoAvBSl/zPDal0IMFmS66+mjTxELTKTh8LVuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKTh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKTh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU1i9Xyz4AvBSl/y/DZl0IMFmO66umjUBEKTKPh77ZuHgU=');

export const NotificationProvider = ({ children }) => {
const { user, userRole } = useAuth();
const [notifications, setNotifications] = useState([]);
const [lastIncidentCount, setLastIncidentCount] = useState(0);
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
if (!user || (userRole !== 'admin' && userRole !== 'officer')) return;const q = query(
  collection(db, 'incidents'),
  orderBy('createdAt', 'desc'),
  limit(50)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const currentCount = snapshot.docs.length;

  if (lastIncidentCount > 0 && currentCount > lastIncidentCount) {
    const newIncidents = [];
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        newIncidents.push({
          id: change.doc.id,
          ...data,
          timestamp: new Date()
        });
      }
    });

    if (newIncidents.length > 0) {
      try {
        notificationSound.play().catch(err => console.log('Audio play failed:', err));
      } catch (err) {}

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 New Incident Reported', {
          body: `${newIncidents[0].title || 'Untitled'} - ${newIncidents[0].location || 'Unknown location'}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }

      setNotifications(prev => [...newIncidents, ...prev].slice(0, 20));
      setUnreadCount(prev => prev + newIncidents.length);
    }
  }

  setLastIncidentCount(currentCount);
});

if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

return () => unsubscribe();
}, [user, userRole, lastIncidentCount]);

const markAsRead = () => {
setUnreadCount(0);
};

const clearNotifications = () => {
setNotifications([]);
setUnreadCount(0);
};

return (
<NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearNotifications }}>
{children}
</NotificationContext.Provider>
);
};