// Error types
export const ErrorTypes = {
  FIREBASE: 'FIREBASE_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOTIFICATION: 'NOTIFICATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Custom error class
export class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date();
  }
}

// Error handler
export const handleError = (error) => {
  // Log the error
  console.error('Error occurred:', {
    type: error.type || 'UNKNOWN',
    message: error.message,
    timestamp: error.timestamp || new Date(),
    originalError: error.originalError
  });

  // Return user-friendly message
  return {
    type: error.type || ErrorTypes.UNKNOWN,
    message: getUserFriendlyMessage(error),
    success: false
  };
};

// Get user-friendly error message
const getUserFriendlyMessage = (error) => {
  switch (error.type) {
    case ErrorTypes.FIREBASE:
      return 'There was an issue with the database. Please try again.';
    case ErrorTypes.VALIDATION:
      return error.message || 'Please check your input and try again.';
    case ErrorTypes.NOTIFICATION:
      return 'Failed to send notification. The incident was saved.';
    case ErrorTypes.NETWORK:
      return 'Network connection issue. Please check your internet connection.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};