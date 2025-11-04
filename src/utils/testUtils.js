import { sendEmailNotification } from './emailService';
import { ErrorTypes, AppError } from './errorHandler';

export const testEmailNotification = async () => {
  const testIncident = {
    id: 'TEST-123',
    title: 'Test Incident',
    location: 'Test Location',
    severity: 'low',
    description: 'This is a test incident for notification testing.',
    timestamp: new Date().toISOString()
  };

  try {
    console.log('Sending test email notification...');
    await sendEmailNotification(testIncident);
    console.log('Test email sent successfully!');
    return {
      success: true,
      message: 'Test email sent successfully!'
    };
  } catch (error) {
    throw new AppError(
      ErrorTypes.NOTIFICATION,
      'Failed to send test email',
      error
    );
  }
};

// Add this to verify your environment variables are set correctly
export const verifyEnvironmentVariables = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_EMAILJS_SERVICE_ID',
    'VITE_EMAILJS_TEMPLATE_ID',
    'VITE_EMAILJS_PUBLIC_KEY',
    'VITE_ADMIN_EMAIL'
  ];

  const missing = required.filter(
    key => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new AppError(
      ErrorTypes.VALIDATION,
      `Missing environment variables: ${missing.join(', ')}`
    );
  }

  return {
    success: true,
    message: 'All required environment variables are set'
  };
};