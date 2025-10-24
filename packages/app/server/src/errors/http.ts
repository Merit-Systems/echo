export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class PaymentRequiredError extends HttpError {
  constructor(message: string = 'Payment Required') {
    super(402, message);
  }
}

export class MaxInFlightRequestsError extends HttpError {
  constructor(message: string = 'Max In Flight Requests') {
    super(429, message);
  }
}

export class UnknownModelError extends HttpError {
  constructor(message: string = 'Unknown Model argument passed in') {
    super(400, message);
  }
}

export class MissingProxyError extends HttpError {
  constructor(
    message: string = 'Missing proxy parameter: Query must be passed with ?proxy="<proxy_url>"'
  ) {
    super(400, message);
  }
}

export class InvalidProxyError extends HttpError {
  constructor(
    message: string = 'Invalid proxy URL: Proxy must be a valid URL. Example: ?proxy="https://proxy.example.com"'
  ) {
    super(400, message);
  }
}
