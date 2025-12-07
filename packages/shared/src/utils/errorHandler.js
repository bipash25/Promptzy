// User-friendly error message mappings
const errorMessages = {
  // Auth errors
  'Invalid login credentials': 'Incorrect email or password. Please try again.',
  'Email not confirmed': 'Please check your email and verify your account before signing in.',
  'User already registered': 'An account with this email already exists. Try signing in instead.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  'Unable to validate email address: invalid format': 'Please enter a valid email address.',
  'Signup requires a valid password': 'Please enter a valid password.',
  'Email rate limit exceeded': 'Too many attempts. Please try again in a few minutes.',
  'For security purposes, you can only request this once every 60 seconds': 'Please wait a moment before trying again.',
  
  // Database errors
  'duplicate key value violates unique constraint': 'This item already exists.',
  'Row level security policy violation': 'You don\'t have permission to perform this action.',
  'PGRST116': 'The requested item was not found.',
  'PGRST301': 'The request was invalid. Please try again.',
  
  // Network errors
  'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
  'NetworkError': 'Network error. Please check your connection and try again.',
  'TypeError: Failed to fetch': 'Connection error. Please check your internet connection.',
  
  // Share errors
  'Invalid or expired share link': 'This share link is no longer valid.',
  'This share link has expired': 'This share link has expired.',
  'Incorrect password': 'The password you entered is incorrect.',
  
  // Generic errors
  'An error occurred': 'Something went wrong. Please try again.',
  'Server error': 'Server error. Please try again later.',
};

/**
 * Convert a technical error message to a user-friendly message
 * @param {Error|string} error - The error object or message
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyError = (error) => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Check for exact matches first
  if (errorMessages[errorMessage]) {
    return errorMessages[errorMessage];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(errorMessages)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Return a generic message if no match found
  return 'Something went wrong. Please try again.';
};

/**
 * Get error code from Supabase error
 * @param {Error} error - The error object
 * @returns {string|null} Error code if available
 */
export const getErrorCode = (error) => {
  return error?.code || error?.status || null;
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  const message = error?.message?.toLowerCase() || '';
  return message.includes('fetch') || 
         message.includes('network') || 
         message.includes('connection');
};

/**
 * Check if error is an authentication error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code || '';
  return message.includes('auth') || 
         message.includes('login') || 
         message.includes('password') ||
         message.includes('credentials') ||
         code.includes('auth');
};

/**
 * Check if error requires user to re-authenticate
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const requiresReauth = (error) => {
  const message = error?.message?.toLowerCase() || '';
  return message.includes('session') || 
         message.includes('token') || 
         message.includes('expired') ||
         error?.status === 401;
};

/**
 * Log error for debugging (only in development)
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 */
export const logError = (context, error) => {
  const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || 
                (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
  
  if (isDev) {
    console.error(`[${context}]`, error);
  }
  
  // TODO: In production, send to error tracking service
  // Example: Sentry.captureException(error, { tags: { context } });
};

export default {
  getUserFriendlyError,
  getErrorCode,
  isNetworkError,
  isAuthError,
  requiresReauth,
  logError,
};