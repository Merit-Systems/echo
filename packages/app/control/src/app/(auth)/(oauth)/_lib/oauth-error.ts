export enum OAuthErrorType {
  INVALID_REQUEST = 'invalid_request',
  INVALID_CLIENT = 'invalid_client',
  UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type',
  SERVER_ERROR = 'server_error',
  UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
}

export type OAuthErrorBody = {
  error: OAuthErrorType;
  error_description?: string;
};

export class OAuthError extends Error {
  readonly body: OAuthErrorBody;
  constructor(body: OAuthErrorBody) {
    super(body.error);
    this.body = body;
  }
}
