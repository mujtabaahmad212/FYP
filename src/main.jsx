import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { IncidentsProvider } from './context/IncidentsContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          {/* Add BrowserRouter here */}
          <BrowserRouter>
            <AuthProvider>
              <SettingsProvider>
                <IncidentsProvider>
                  <App />
                </IncidentsProvider>
              </SettingsProvider>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('App mounted successfully');
  } catch (error) {
    console.error('Error mounting app:', error);
    // ... (your error handling code)
  }
}