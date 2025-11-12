import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Bell, Palette, Shield, Eye, EyeOff, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Settings = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => setLocalSettings(settings), [settings]);

  const handleChange = (category, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    Object.keys(localSettings).forEach(category =>
      Object.keys(localSettings[category]).forEach(key =>
        updateSettings(category, key, localSettings[category][key])
      )
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-slate-50 transition">
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
        <div className="w-14 h-7 bg-slate-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 relative after:absolute after:top-0.5 after:left-1 after:bg-white after:w-6 after:h-6 after:rounded-full after:transition-all peer-checked:after:translate-x-full shadow-sm"></div>
      </label>
    </div>
  );

  const SettingSection = ({ icon: Icon, title, description, children }) => (
    <div className="card">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gradient">System Settings</h2>
          <p className="text-slate-600">Configure your security system preferences</p>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl animate-in">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Notification Settings */}
      <SettingSection
        icon={Bell}
        title="Notification Preferences"
        description="Control how you receive alerts and updates"
      >
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
          description="Only receive notifications for critical and high incidents"
        />
        <ToggleSwitch
          checked={localSettings.notifications?.soundAlerts ?? true}
          onChange={(e) => handleChange('notifications', 'soundAlerts', e.target.checked)}
          label="Sound Alerts"
          description="Play sound when new incidents are reported"
        />
      </SettingSection>

      {/* Security Settings */}
      <SettingSection
        icon={Shield}
        title="Security Features"
        description="Manage security-related system features"
      >
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
          description="Automatically assign incidents to officers based on availability"
        />
        <ToggleSwitch
          checked={localSettings.features?.realTimeSync ?? true}
          onChange={(e) => handleChange('features', 'realTimeSync', e.target.checked)}
          label="Real-time Sync"
          description="Synchronize data across all your devices"
        />
      </SettingSection>

      {/* Appearance Settings */}
      <SettingSection
        icon={Palette}
        title="Appearance & Localization"
        description="Customize how the application looks"
      >
        <div className="p-4 rounded-xl hover:bg-slate-50 transition">
          <label className="block text-sm font-bold text-slate-900 mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', icon: '☀️' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'auto', label: 'Auto', icon: '⚙️' }
            ].map(theme => (
              <button
                key={theme.value}
                onClick={() => handleChange('appearance', 'theme', theme.value)}
                className={`p-3 rounded-lg border-2 font-medium transition ${
                  localSettings.appearance?.theme === theme.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 hover:border-blue-400'
                }`}
              >
                <span className="text-2xl mr-2">{theme.icon}</span>
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl hover:bg-slate-50 transition">
          <label className="block text-sm font-bold text-slate-900 mb-3">Language</label>
          <select
            value={localSettings.appearance?.language || 'en'}
            onChange={(e) => handleChange('appearance', 'language', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="en">English</option>
            <option value="ur">Urdu (اردو)</option>
            <option value="ar">Arabic (العربية)</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
          </select>
        </div>

        <div className="p-4 rounded-xl hover:bg-slate-50 transition">
          <label className="block text-sm font-bold text-slate-900 mb-3">Date Format</label>
          <select
            value={localSettings.appearance?.dateFormat || 'MM/DD/YYYY'}
            onChange={(e) => handleChange('appearance', 'dateFormat', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </SettingSection>

      {/* Privacy & Data */}
      <SettingSection
        icon={Eye}
        title="Privacy & Data"
        description="Manage your personal data and privacy"
      >
        <ToggleSwitch
          checked={true}
          onChange={() => {}}
          label="Data Collection"
          description="Allow system to collect analytics for improvement"
        />
        <div className="p-4 rounded-xl hover:bg-slate-50 transition border-t-2 border-slate-200 mt-4">
          <button className="text-red-600 hover:text-red-700 font-medium text-sm">
            Download My Data
          </button>
        </div>
      </SettingSection>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className={`flex-1 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 ${
            saved
              ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg'
              : 'btn-primary'
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </button>

        <button
          onClick={() => {
            resetSettings();
            setSaved(false);
          }}
          className="px-6 py-4 rounded-xl font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Info Box */}
      <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
        <h4 className="font-bold text-blue-900 mb-2">💡 Tip</h4>
        <p className="text-blue-800 text-sm">
          Your settings are automatically synchronized across all your devices. Changes take effect immediately.
        </p>
      </div>
    </div>
  );
};

export default Settings;
