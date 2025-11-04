import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

// Default settings that match the Settings.jsx page
const defaultSettings = {
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    highPriorityOnly: false,
    soundAlerts: true,
  },
  features: {
    aiRecommendations: true,
    autoAssignment: false,
    realTimeSync: true,
  },
  appearance: {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge stored settings with defaults to ensure all keys exist
        return {
          notifications: { ...defaultSettings.notifications, ...parsed.notifications },
          features: { ...defaultSettings.features, ...parsed.features },
          appearance: { ...defaultSettings.appearance, ...parsed.appearance },
        };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    // Apply theme to body
    if (settings.appearance.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [settings]);

  // Updated function to handle nested state
  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};