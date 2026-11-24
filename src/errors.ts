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
  constructor(message = 'Rate limit exceeded. Slow down your request rate.') {
    super(message, 429, 'failed');
    this.name = 'RateLimitError';
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

export class ResultError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;

  constructor(message: string, code: string, retryable = false) {
    super(message);
    this.name = 'ResultError';
    this.code = code;
    this.retryable = retryable;
  }
}

export class JobTimeoutError extends TimeoutError {
  public readonly flow: string;
  public readonly jobId: string;

  constructor(flow: string, jobId: string, timeoutMs: number) {
    super(`The ${flow} job ${jobId} was still running after ${timeoutMs}ms.`);
    this.name = 'JobTimeoutError';
    this.flow = flow;
    this.jobId = jobId;
  }
}
