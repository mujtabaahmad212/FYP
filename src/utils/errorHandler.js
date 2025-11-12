export const ErrorTypes = {
  VALIDATION: 'Validation Error',
  NOTIFICATION: 'Notification Error',
  NETWORK: 'Network Error'
};

export class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.type = type;
    this.originalError = originalError;
  }
}
