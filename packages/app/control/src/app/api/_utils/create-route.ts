import { RouteHandlerBuilder } from './handler-builder';
import { HandlerServerErrorFn } from './types';

export function createZodRoute(params?: {
  handleServerError?: HandlerServerErrorFn;
}) {
  return new RouteHandlerBuilder({
    handleServerError: params?.handleServerError,
    contextType: {},
  });
}
