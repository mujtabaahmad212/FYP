import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { IncidentsProvider } from './context/IncidentsContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Simple, reliable mounting
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h1>Error</h1><p>Root element not found. Please check your HTML.</p></div>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <SettingsProvider>
              <IncidentsProvider>
                <App />
              </IncidentsProvider>
            </SettingsProvider>
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('App mounted successfully');
  } catch (error) {
    console.error('Error mounting app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; background: #fee; border: 2px solid #f00; border-radius: 8px;">
        <h1 style="color: #c00;">Application Error</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Stack:</strong></p>
        <pre style="background: #fff; padding: 10px; border-radius: 4px; overflow: auto;">${error.stack}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #c00; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
          Reload Page
        </button>
      </div>
    `;
  }
}
