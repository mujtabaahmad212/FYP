import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('appSettings');
    return stored ? JSON.parse(stored) : {
      allowIncidentCreation: true,
      allowIncidentEditing: true,
      allowIncidentDeletion: true,
      showMap: true,
      showAnalytics: true,
      enableNotifications: true,
      autoRefresh: false,
      refreshInterval: 30,
      theme: 'light',
      language: 'en',
    };
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      allowIncidentCreation: true,
      allowIncidentEditing: true,
      allowIncidentDeletion: true,
      showMap: true,
      showAnalytics: true,
      enableNotifications: true,
      autoRefresh: false,
      refreshInterval: 30,
      theme: 'light',
      language: 'en',
    };
    setSettings(defaultSettings);
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};