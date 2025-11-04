import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from './Settings';
import { useSettings } from '../context/SettingsContext';

// Mock the useSettings hook
jest.mock('../context/SettingsContext', () => ({
  useSettings: jest.fn(),
}));

describe('Settings component', () => {
  const mockSettings = {
    notifications: {
      emailAlerts: true,
      pushNotifications: false,
      highPriorityOnly: true,
      soundAlerts: false,
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

  const mockUpdateSettings = jest.fn();

  beforeEach(() => {
    useSettings.mockReturnValue({
      settings: mockSettings,
      updateSettings: mockUpdateSettings,
      resetSettings: jest.fn(),
    });
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders correctly with initial settings', () => {
    render(<Settings />);

    // Check notification toggles
    expect(screen.getByLabelText('Email Alerts')).toBeChecked();
    expect(screen.getByLabelText('Push Notifications')).not.toBeChecked();
    expect(screen.getByLabelText('High Priority Only')).toBeChecked();
    expect(screen.getByLabelText('Sound Alerts')).not.toBeChecked();

    // Check feature toggles
    expect(screen.getByLabelText('AI Recommendations')).toBeChecked();
    expect(screen.getByLabelText('Auto-Assignment')).not.toBeChecked();
    expect(screen.getByLabelText('Real-time Sync')).toBeChecked();

    // Check appearance selects
    expect(screen.getByLabelText('Theme')).toHaveValue('light');
    expect(screen.getByLabelText('Language')).toHaveValue('en');
    expect(screen.getByLabelText('Date Format')).toHaveValue('MM/DD/YYYY');
  });

  test('handleChange updates local state', () => {
    render(<Settings />);

    const emailAlertsToggle = screen.getByLabelText('Email Alerts');
    fireEvent.click(emailAlertsToggle);
    expect(emailAlertsToggle).not.toBeChecked(); // Local state should update

    const themeSelect = screen.getByLabelText('Theme');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    expect(themeSelect).toHaveValue('dark'); // Local state should update
  });

  test('handleSave calls updateSettings from context with correct arguments', () => {
    render(<Settings />);

    // Change a setting
    fireEvent.click(screen.getByLabelText('Email Alerts'));
    fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'dark' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    // Expect updateSettings to be called for each setting in each category
    expect(mockUpdateSettings).toHaveBeenCalledWith('notifications', 'emailAlerts', false);
    expect(mockUpdateSettings).toHaveBeenCalledWith('notifications', 'pushNotifications', false);
    expect(mockUpdateSettings).toHaveBeenCalledWith('notifications', 'highPriorityOnly', true);
    expect(mockUpdateSettings).toHaveBeenCalledWith('notifications', 'soundAlerts', false);
    expect(mockUpdateSettings).toHaveBeenCalledWith('features', 'aiRecommendations', true);
    expect(mockUpdateSettings).toHaveBeenCalledWith('features', 'autoAssignment', false);
    expect(mockUpdateSettings).toHaveBeenCalledWith('features', 'realTimeSync', true);
    expect(mockUpdateSettings).toHaveBeenCalledWith('appearance', 'theme', 'dark');
    expect(mockUpdateSettings).toHaveBeenCalledWith('appearance', 'language', 'en');
    expect(mockUpdateSettings).toHaveBeenCalledWith('appearance', 'dateFormat', 'MM/DD/YYYY');

    expect(mockUpdateSettings).toHaveBeenCalledTimes(10); // Total number of settings
  });

  test('"Settings Saved!" message appears and disappears after saving', async () => {
    render(<Settings />);

    const saveButton = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Settings Saved!')).toBeInTheDocument();

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Settings Saved!')).not.toBeInTheDocument();
    });
  });
});
