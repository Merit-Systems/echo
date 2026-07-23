# Error Handling and HTTP Error Classes in packages/app/server/src

## Purpose
This area defines custom error classes for HTTP-related errors, primarily used to represent specific HTTP status conditions (e.g., 402 Payment Required, 401 Unauthorized, 503 FacilitatorProxyError, 400 Unknown Model, and generic status code errors). It standardizes error responses and facilitates consistent error handling across the server.

## Boundaries
- **Belongs:** Custom error classes extending native Error, used throughout server request handling to signal specific HTTP errors.
- **Does NOT belong:** General application logic unrelated to HTTP errors; error handling for non-HTTP contexts; error serialization/deserialization outside error classes; external error handling middleware (unless explicitly integrated here).

## Invariants
- Each error class must extend the native Error class.
- Constructor signatures must match the specified patterns, ensuring message consistency.
- For `constructor(statusCode: number, message: string)`, the statusCode must be stored as a property and used in error responses.
- Default messages should be used if no message argument is provided.
- Error instances should be properly initialized with message and, where applicable, statusCode.
- No error class should override the message property after construction.
- Error classes must be serializable if sent over network (e.g., include toJSON if needed).

## Patterns
- Use default messages for constructors with no arguments.
- For HTTP status errors, ensure the status code is stored and accessible.
- Maintain consistent naming: `HttpPaymentRequiredError`, `HttpUnauthorizedError`, etc.
- Use async functions (e.g., `getBalance`) with explicit Promise return types.
- When creating new error instances, pass messages explicitly; avoid implicit error creation.
- Follow the pattern of defining error classes in `packages/app/server/src/errors/http.ts`.
- Error classes should be used in request validation, middleware, and service layers to propagate HTTP errors.

## Pitfalls
- **Churn:** Constructor implementations are frequently modified; avoid relying on implicit behavior.
- **Null-safety:** Ensure message parameters are validated or defaulted; avoid passing undefined.
- **Error inheritance:** Forgetting to call `super()` with message can break stack traces.
- **Status code handling:** Misassigning or omitting `statusCode` in `constructor(statusCode, message)` leads to incorrect error responses.
- **Serialization:** Not implementing serialization methods may cause issues when errors are sent over HTTP.
- **Misuse of default messages:** Hardcoded defaults may become outdated; ensure they reflect current API semantics.
- **Churn hotspots:** Frequent modifications suggest these classes are sensitive; test error handling thoroughly.

## Dependencies
- No external dependencies are directly imported or required for these error classes.
- Usage depends on consistent error handling middleware that interprets these error instances and converts them into HTTP responses.
- Ensure that the server's response layer correctly interprets `statusCode` and error message properties.

---

**Summary:**  
This cluster encapsulates custom HTTP error classes that standardize server error responses. Agents must understand the constructor patterns, invariants around message and statusCode handling, and the importance of consistent error serialization. Frequent modifications indicate these classes are central to error propagation; careful adherence to patterns and invariants is essential to prevent bugs and maintainability issues.