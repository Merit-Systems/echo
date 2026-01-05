# Trace Logging Middleware (packages/app/server/src)

## Purpose
Implements an Express middleware function `traceLoggingMiddleware` that logs request details for tracing and debugging purposes. It ensures consistent logging for incoming requests and their lifecycle within the server.

## Boundaries
- **Belongs here:** Request lifecycle logging, middleware setup, request context enrichment.
- **Does NOT belong here:** Business logic, route handling, response formatting, error handling beyond logging, schema definitions (handled in `descriptionForRoute.ts`), or external request processing.

## Invariants
- `traceLoggingMiddleware` must always call `next()` exactly once, regardless of errors.
- It must log at the start of request processing and after response is sent, capturing request method, URL, headers, and response status.
- Null-safety: `req`, `res`, and `next` are guaranteed to be non-null; no null checks needed.
- Response status should be captured after response finishes, not before.
- Logging should not block or delay response; perform asynchronously if needed.
- Middleware must not modify `req` or `res` objects unless explicitly intended for tracing.
- Churn: Frequently modified (5 versions); ensure backward compatibility with previous logging formats.

## Patterns
- Use consistent naming: `traceLoggingMiddleware`.
- Log request details at the start (`req.method`, `req.url`, headers) and after response (`res.statusCode`).
- Attach event listeners to `res` (`finish` event) for capturing response completion.
- Handle errors gracefully; ensure `next()` is called even if logging fails.
- Use external dependencies (`bodies`, `response`, `status`) for structured logging and response handling.
- Maintain idempotency: middleware should be safe to call multiple times without side effects.
- Follow existing code style: arrow functions, explicit types, minimal side effects.

## Pitfalls
- Forgetting to call `next()`, causing request hang or deadlock.
- Logging after response has already been sent, missing status code.
- Not handling errors in logging, leading to unhandled exceptions.
- Modifying request or response objects unintentionally.
- Churn: frequent modifications increase risk of breaking invariants; test thoroughly.
- Over-logging: avoid sensitive data exposure in logs.
- Churn hotspots imply the middleware may evolve; monitor for breaking changes.

## Dependencies
- **request:** Used to access request data; must be used carefully to avoid blocking.
- **bodies:** For parsing request bodies if needed for logging (not shown explicitly here).
- **response:** For structured response data, if applicable.
- **status:** For standardized status code handling.
- **External logging library (implied):** Ensure logs are asynchronous and non-blocking.
- Use these dependencies according to their API contracts; avoid side effects or assumptions about their internal state.

---

**Note:** Given the frequent modifications, always review recent changes for compatibility, especially around response lifecycle handling and logging formats.