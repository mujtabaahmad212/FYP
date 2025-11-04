import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from './SettingsContext';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.body.classList.remove('dark');
  });

  const TestComponent = () => {
    const { settings, updateSettings, resetSettings } = useSettings();
    return (
      <div>
        <div data-testid="theme">{settings.appearance.theme}</div>
        <button onClick={() => updateSettings('appearance', 'theme', 'dark')} data-testid="set-dark">Set Dark</button>
        <button onClick={() => updateSettings('appearance', 'theme', 'light')} data-testid="set-light">Set Light</button>
        <button onClick={() => updateSettings('notifications', 'emailAlerts', false)} data-testid="toggle-email-alerts">Toggle Email</button>
        <button onClick={resetSettings} data-testid="reset-settings">Reset</button>
      </div>
    );
  };

  test('initializes with default settings if no localStorage value', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    // Add more assertions for other default settings if needed
  });

  test('loads settings from localStorage if available', () => {
    localStorageMock.setItem('appSettings', JSON.stringify({ 
      notifications: { emailAlerts: false },
      appearance: { theme: 'dark' }
    }));

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  test('updateSettings correctly updates a nested setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    
    act(() => {
      screen.getByTestId('set-dark').click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  test('resetSettings resets to default values', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    act(() => {
      screen.getByTestId('set-dark').click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    act(() => {
      screen.getByTestId('reset-settings').click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  test('settings are saved to localStorage on change', () => {
    const setItemSpy = jest.spyOn(localStorageMock, 'setItem');
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    act(() => {
      screen.getByTestId('set-dark').click();
    });

    expect(setItemSpy).toHaveBeenCalledWith('appSettings', expect.stringContaining('"theme":"dark"'));
    setItemSpy.mockRestore();
  });

  test('dark mode class is applied to body when theme is dark', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    act(() => {
      screen.getByTestId('set-dark').click();
    });
    expect(document.body.classList.contains('dark')).toBe(true);

    act(() => {
      screen.getByTestId('set-light').click();
    });
    expect(document.body.classList.contains('dark')).toBe(false);
  });
});
