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
