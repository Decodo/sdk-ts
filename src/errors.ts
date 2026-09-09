export class DecodoError extends Error {
  public readonly statusCode: number;
  public readonly apiStatus: string | undefined;

  constructor(message: string, statusCode: number, apiStatus?: string) {
    super(message);
    this.name = 'DecodoError';
    this.statusCode = statusCode;
    this.apiStatus = apiStatus;
  }
}

export class AuthenticationError extends DecodoError {
  constructor(message = 'Authentication failed. Check your credentials.') {
    super(message, 401, 'failed');
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends DecodoError {
  public readonly retryAfterMs: number | undefined;

  constructor(
    message = 'Rate limit exceeded. Slow down your request rate.',
    retryAfterMs?: number,
  ) {
    super(message, 429, 'failed');
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export class ValidationError extends DecodoError {
  public readonly errors: unknown[] | undefined;

  constructor(message: string, errors?: unknown[]) {
    super(message, 422, 'failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class TimeoutError extends Error {
  constructor(message = 'The request timed out.') {
    super(message);
    this.name = 'TimeoutError';
  }
}
