/**
 * Authentication Error Handler Utility
 * Provides user-friendly error messages for common authentication errors
 */

export type AuthErrorType = 
  | 'invalid_credentials'
  | 'email_not_confirmed' 
  | 'invalid_email'
  | 'weak_password'
  | 'user_exists'
  | 'password_mismatch'
  | 'expired_token'
  | 'rate_limit'
  | 'server_error'
  | 'network_error'
  | 'unknown';

interface AuthErrorMap {
  [key: string]: {
    type: AuthErrorType;
    message: string;
  }
}

// Map Supabase error codes to user-friendly messages
const AUTH_ERROR_MAP: AuthErrorMap = {
  'auth/invalid-email': { 
    type: 'invalid_email', 
    message: 'The email address is invalid.' 
  },
  'auth/invalid-login-credentials': { 
    type: 'invalid_credentials', 
    message: 'Incorrect email or password. Please try again.' 
  },
  'auth/email-already-in-use': { 
    type: 'user_exists', 
    message: 'This email is already registered. Try logging in instead.' 
  },
  'auth/user-not-found': { 
    type: 'invalid_credentials', 
    message: 'No account found with this email. Please sign up.' 
  },
  'auth/weak-password': { 
    type: 'weak_password', 
    message: 'Your password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.' 
  },
  'auth/email-not-confirmed': { 
    type: 'email_not_confirmed', 
    message: 'Please verify your email address before logging in.' 
  },
  'auth/expired-action-code': { 
    type: 'expired_token', 
    message: 'This link has expired. Please request a new one.' 
  },
  'auth/too-many-requests': { 
    type: 'rate_limit', 
    message: 'Too many attempts. Please try again later.' 
  },
  'auth/network-request-failed': { 
    type: 'network_error', 
    message: 'Network error. Please check your internet connection and try again.' 
  },
  'auth/internal-error': { 
    type: 'server_error', 
    message: 'Server error. Please try again later.' 
  }
};

/**
 * Handles authentication errors and returns user-friendly messages
 */
export const handleAuthError = (error: any): { type: AuthErrorType; message: string } => {
  // Extract error code for Supabase errors
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';
  
  // Check for specific error messages from Supabase
  if (errorMessage.includes('Email not confirmed')) {
    return { type: 'email_not_confirmed', message: 'Please verify your email address before logging in.' };
  }
  
  if (errorMessage.includes('Invalid login credentials')) {
    return { type: 'invalid_credentials', message: 'Incorrect email or password. Please try again.' };
  }
  
  if (errorMessage.includes('User already registered')) {
    return { type: 'user_exists', message: 'This email is already registered. Try logging in instead.' };
  }
  
  if (errorMessage.includes('Password should be at least 6 characters')) {
    return { type: 'weak_password', message: 'Your password must be at least 6 characters long.' };
  }
  
  // Check for error code in our map
  if (errorCode && AUTH_ERROR_MAP[errorCode]) {
    return AUTH_ERROR_MAP[errorCode];
  }
  
  // Default error message
  return { 
    type: 'unknown', 
    message: 'An error occurred during authentication. Please try again.' 
  };
};

/**
 * Analyzes a password and returns strength feedback
 */
export const getPasswordStrength = (password: string): { 
  score: number; 
  feedback: string;
} => {
  let score = 0;
  const feedback: string[] = [];
  
  if (!password) {
    return { score: 0, feedback: 'Please enter a password' };
  }
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }
  
  // Contains lowercase letters
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  // Contains uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  // Contains numbers
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }
  
  // Contains special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }
  
  return {
    score,
    feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password'
  };
};

/**
 * Validates an email address format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 