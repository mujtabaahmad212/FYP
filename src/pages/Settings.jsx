import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Bell, Mail, Smartphone, Palette, Map, Shield } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (category, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
  };

  const handleSave = () => {
    Object.keys(localSettings).forEach(category => {
      Object.keys(localSettings[category]).forEach(key => {
        updateSettings(category, key, localSettings[category][key]);
      });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-slate-900">{label}</p>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gradient-text">System Settings</h2>
          <p className="text-slate-600 mt-1">Configure your security system preferences</p>
        </div>
      </div>
      
      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
        </div>
        <div className="space-y-2">
          <ToggleSwitch
            checked={localSettings.notifications?.emailAlerts ?? true}
            onChange={(e) => handleChange('notifications', 'emailAlerts', e.target.checked)}
            label="Email Alerts"
            description="Receive email notifications for high-priority incidents"
          />
          <ToggleSwitch
            checked={localSettings.notifications?.pushNotifications ?? true}
            onChange={(e) => handleChange('notifications', 'pushNotifications', e.target.checked)}
            label="Push Notifications"
            description="Get real-time push notifications on your device"
          />
          <ToggleSwitch
            checked={localSettings.notifications?.highPriorityOnly ?? false}
            onChange={(e) => handleChange('notifications', 'highPriorityOnly', e.target.checked)}
            label="High Priority Only"
            description="Only receive notifications for critical incidents"
          />
          <ToggleSwitch
            checked={localSettings.notifications?.soundAlerts ?? true}
            onChange={(e) => handleChange('notifications', 'soundAlerts', e.target.checked)}
            label="Sound Alerts"
            description="Play sound when new incidents are reported"
          />
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">System Features</h3>
        </div>
        <div className="space-y-2">
          <ToggleSwitch
            checked={localSettings.features?.aiRecommendations ?? true}
            onChange={(e) => handleChange('features', 'aiRecommendations', e.target.checked)}
            label="AI Recommendations"
            description="Use AI to suggest incident handling strategies"
          />
          <ToggleSwitch
            checked={localSettings.features?.autoAssignment ?? false}
            onChange={(e) => handleChange('features', 'autoAssignment', e.target.checked)}
            label="Auto-Assignment"
            description="Automatically assign incidents to available officers"
          />
          <ToggleSwitch
            checked={localSettings.features?.realTimeSync ?? true}
            onChange={(e) => handleChange('features', 'realTimeSync', e.target.checked)}
            label="Real-time Sync"
            description="Synchronize data in real-time across all devices"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 card-hover">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-slate-900 mb-2">Theme</label>
            <select 
              value={localSettings.appearance?.theme || 'light'}
              onChange={(e) => handleChange('appearance', 'theme', e.target.value)} 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-900 mb-2">Language</label>
            <select 
              value={localSettings.appearance?.language || 'en'}
              onChange={(e) => handleChange('appearance', 'language', e.target.value)} 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-900 mb-2">Date Format</label>
            <select 
              value={localSettings.appearance?.dateFormat || 'MM/DD/YYYY'}
              onChange={(e) => handleChange('appearance', 'dateFormat', e.target.value)} 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full btn-primary flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover-lift ${
          saved ? 'bg-gradient-to-r from-green-600 to-green-500' : ''
        }`}
      >
        {saved ? (
          <>
            <Save className="w-5 h-5" />
            <span>Settings Saved!</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </>
        )}
      </button>
    </div>
  );
};

export default Settings;
