export class ErrorHandler {
  static classify(error) {
    const status = error.status || error.code;

    if (status === 401 || status === 403) {
      return {
        type: 'AUTH_ERROR',
        userMessage: 'API key is invalid or expired. Please check your settings.',
        retryable: false,
      };
    }

    if (status === 429) {
      return {
        type: 'RATE_LIMIT',
        userMessage: 'Rate limit exceeded. Please wait a moment and try again.',
        retryable: true,
      };
    }

    if (status === 400) {
      return {
        type: 'BAD_REQUEST',
        userMessage:
          'Invalid request. The content may be too large or contain unsupported characters.',
        retryable: false,
      };
    }

    if (status >= 500 && status < 600) {
      return {
        type: 'SERVER_ERROR',
        userMessage: 'Service temporarily unavailable. Please try again in a moment.',
        retryable: true,
      };
    }

    if (error.code === 'TIMEOUT') {
      return {
        type: 'TIMEOUT',
        userMessage: 'Request timed out. The video may be too long or the service is slow.',
        retryable: true,
      };
    }

    if (error.message?.includes('Failed to fetch')) {
      return {
        type: 'NETWORK_ERROR',
        userMessage: 'Network error. Please check your internet connection.',
        retryable: true,
      };
    }

    return {
      type: 'UNKNOWN_ERROR',
      userMessage: `An error occurred: ${error.message}`,
      retryable: false,
    };
  }

  static createUserError(error) {
    const classified = this.classify(error);
    const userError = new Error(classified.userMessage);
    userError.type = classified.type;
    userError.retryable = classified.retryable;
    userError.originalError = error;
    return userError;
  }
}
