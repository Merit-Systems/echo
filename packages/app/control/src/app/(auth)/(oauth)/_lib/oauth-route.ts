import { createZodRoute } from '@/lib/api/create-route';
import { OAuthError, OAuthErrorBody, OAuthErrorType } from './oauth-error';
import { NextResponse } from 'next/server';
import {
  HandleInternalErrorFn,
  HandlerServerErrorFn,
  InternalRouteHandlerError,
} from '@/lib/api/types';

const handleOAuthServerError: HandlerServerErrorFn<OAuthErrorBody> = (
  error: Error
) => {
  if (error instanceof OAuthError) {
    return NextResponse.json(error.body, { status: 400 });
  }
  return NextResponse.json(
    { error: OAuthErrorType.SERVER_ERROR, error_description: error.message },
    { status: 500 }
  );
};

const handleOAuthInternalError: HandleInternalErrorFn<OAuthErrorBody> = (
  error: InternalRouteHandlerError
) => {
  const { errors } = error.body;
  if (!errors?.length) {
    return NextResponse.json(
      { error: OAuthErrorType.SERVER_ERROR, error_description: error.message },
      { status: 500 }
    );
  }
  const firstError = errors[0];
  return NextResponse.json(JSON.parse(firstError.message) as OAuthErrorBody, {
    status: 400,
  });
};

export const oauthRoute = createZodRoute({
  handleServerError: handleOAuthServerError,
  handleInternalError: handleOAuthInternalError,
});

export const OAuthRouteError = (error: OAuthErrorBody) => {
  return NextResponse.json(error, {
    status: error.error === OAuthErrorType.SERVER_ERROR ? 500 : 400,
  });
};

export const oauthValidationError = (error: OAuthErrorBody) =>
  JSON.stringify(error);
