export interface BaseError {
  readonly type: string;
  readonly message: string;
  readonly statusCode: number;
  readonly context: Record<string, any> | undefined;
}

export class AuthenticationError implements BaseError {
  readonly type = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401;
  readonly context: { reason?: string; apiKey?: string } | undefined;
  
  constructor(
    public readonly message: string,
    context?: { reason?: string; apiKey?: string }
  ) {
    this.context = context;
  }
}

export class AuthorizationError implements BaseError {
  readonly type = 'AUTHORIZATION_ERROR';
  readonly statusCode = 403;
  readonly context: { resource?: string; userId?: string } | undefined;
  
  constructor(
    public readonly message: string,
    context?: { resource?: string; userId?: string }
  ) {
    this.context = context;
  }
}

export class InvalidApiKeyError implements BaseError {
  readonly type = 'INVALID_API_KEY';
  readonly statusCode = 401;
  readonly message = 'Invalid or expired API key';
  readonly context: { apiKey?: string } | undefined;
  
  constructor(context?: { apiKey?: string }) {
    this.context = context;
  }
}

export class ValidationError implements BaseError {
  readonly type = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly context: { field?: string; value?: any; constraints?: string[] } | undefined;
  
  constructor(
    public readonly message: string,
    context?: { field?: string; value?: any; constraints?: string[] }
  ) {
    this.context = context;
  }
}

export class MissingHeaderError implements BaseError {
  readonly type = 'MISSING_HEADER';
  readonly statusCode = 400;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly headerName: string,
    public readonly message: string = `Missing required header: ${headerName}`,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class ResourceNotFoundError implements BaseError {
  readonly type = 'RESOURCE_NOT_FOUND';
  readonly statusCode = 404;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly resource: string,
    public readonly identifier?: string,
    public readonly message: string = `${resource} not found`,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class PaymentRequiredError implements BaseError {
  readonly type = 'PAYMENT_REQUIRED';
  readonly statusCode = 402;
  readonly message = 'Payment required to access this resource';
  readonly context: { 
    requiredAmount?: number;
    currentBalance?: number;
    resource?: string;
  } | undefined;
  
  constructor(
    context?: { 
      requiredAmount?: number;
      currentBalance?: number;
      resource?: string;
    }
  ) {
    this.context = context;
  }
}

export class InsufficientBalanceError implements BaseError {
  readonly type = 'INSUFFICIENT_BALANCE';
  readonly statusCode = 402;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly requiredAmount: number,
    public readonly currentBalance: number,
    public readonly message: string = 'Insufficient balance',
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class QuotaExceededError implements BaseError {
  readonly type = 'QUOTA_EXCEEDED';
  readonly statusCode = 429;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly quotaType: string,
    public readonly limit: number,
    public readonly current: number,
    public readonly message: string = `${quotaType} quota exceeded`,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class DatabaseError implements BaseError {
  readonly type = 'DATABASE_ERROR';
  readonly statusCode = 500;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly message: string,
    public readonly operation?: string,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class TransactionError implements BaseError {
  readonly type = 'TRANSACTION_ERROR';
  readonly statusCode = 500;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly message: string,
    public readonly transactionId?: string,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class ProviderError implements BaseError {
  readonly type = 'PROVIDER_ERROR';
  readonly statusCode: number;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly provider: string,
    public readonly message: string,
    public readonly originalStatusCode?: number,
    context?: Record<string, any>
  ) {
    this.statusCode = this.mapProviderStatusCode(originalStatusCode);
    this.context = context;
  }
  
  private mapProviderStatusCode(status?: number): number {
    if (!status) return 502;
    
    if (status >= 400 && status < 500) {
      return status;
    } else if (status >= 500) {
      return 502;
    }
    
    return 502;
  }
}

export class ModelNotFoundError implements BaseError {
  readonly type = 'MODEL_NOT_FOUND';
  readonly statusCode = 400;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly model: string,
    public readonly provider?: string,
    public readonly message: string = `Model ${model} not found`,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class StreamError implements BaseError {
  readonly type = 'STREAM_ERROR';
  readonly statusCode = 500;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly message: string,
    public readonly phase?: 'initialization' | 'processing' | 'completion',
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class ConfigurationError implements BaseError {
  readonly type = 'CONFIGURATION_ERROR';
  readonly statusCode = 500;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly message: string,
    public readonly configKey?: string,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class ServiceUnavailableError implements BaseError {
  readonly type = 'SERVICE_UNAVAILABLE';
  readonly statusCode = 503;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly service: string,
    public readonly message: string = `${service} is currently unavailable`,
    public readonly retryAfter?: number,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class RateLimitError implements BaseError {
  readonly type = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly limit: number,
    public readonly window: string,
    public readonly retryAfter: number,
    public readonly message: string = 'Rate limit exceeded',
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class TimeoutError implements BaseError {
  readonly type = 'TIMEOUT_ERROR';
  readonly statusCode = 504;
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly operation: string,
    public readonly timeoutMs: number,
    public readonly message: string = `Operation ${operation} timed out after ${timeoutMs}ms`,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}

export class UnexpectedError implements BaseError {
  readonly type = 'UNEXPECTED_ERROR';
  readonly statusCode = 500;
  readonly message = 'An unexpected error occurred';
  readonly context: Record<string, any> | undefined;
  
  constructor(
    public readonly originalError?: unknown,
    context?: Record<string, any>
  ) {
    this.context = context;
  }
}
