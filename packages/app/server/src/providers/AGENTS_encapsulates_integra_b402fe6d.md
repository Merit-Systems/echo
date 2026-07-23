# GeminiVeoProvider.ts

## Purpose
Encapsulates integration logic with the GeminiVeo external service, managing API interactions, request handling, and response parsing. It acts as the primary interface for consuming GeminiVeo data within the server.

## Boundaries
- **Belongs to:** Provider layer responsible for external service integrations.
- **Does NOT belong to:** Business logic, data persistence, or UI layers.
- **External APIs:** Assumes stable API endpoints and response schemas; any schema change requires code updates.
- **Configuration:** Sensitive parameters (API keys, endpoints) should be injected via environment variables or configuration files, not hardcoded.
- **Error Handling:** Should gracefully handle network errors, timeouts, and unexpected responses; do not propagate raw errors upstream.

## Invariants
- **Request Idempotency:** Requests to GeminiVeo API must include proper authentication tokens and adhere to rate limits.
- **Response Validation:** All responses must be validated against expected schemas; invalid responses should trigger fallback/error logic.
- **Null Safety:** Null or undefined responses from the API should be handled explicitly; do not assume presence of data.
- **Resource Management:** Persistent connections or retries should be managed to avoid leaks or excessive load.
- **Versioning:** The module is version-sensitive; modifications should consider backward compatibility if multiple versions are in use.

## Patterns
- **Naming:** Use clear, descriptive method names reflecting GeminiVeo API actions (e.g., `fetchVeoData`, `parseResponse`).
- **Error Handling:** Use try-catch blocks around async API calls; log errors with context.
- **Configuration:** Use environment variables for API URLs, tokens; validate their presence at startup.
- **Response Parsing:** Centralize response validation and parsing logic; avoid duplicated code.
- **Churn Management:** Given high modification frequency, document assumptions and API contract expectations explicitly in code comments.

## Pitfalls
- **Frequent Changes:** The module is highly volatile; avoid hardcoded values, and implement robust version checks.
- **Coupling:** Tight coupling to specific API response schemas can cause fragility; abstract response handling where possible.
- **Churn Risks:** Frequent updates increase risk of regressions; implement comprehensive tests around API interactions.
- **Null/Undefined Responses:** Failing to check for missing data can cause runtime errors.
- **Rate Limits & Retries:** Ignoring API rate limits or retry strategies can lead to throttling or data inconsistency.
- **Configuration Errors:** Missing or incorrect environment variables can cause silent failures; validate at startup.

## Dependencies
- **HTTP Client:** Use the designated HTTP library (e.g., axios, fetch) with proper timeout settings.
- **Logging:** Integrate with the application's logging system to record request/response details and errors.
- **Configuration Management:** Rely on environment variables or configuration files for API URLs and tokens; validate their presence early.
- **Error Monitoring:** Ensure integration with error tracking tools if available, to catch and analyze failures rapidly.

---

**Note:** Due to high churn, document assumptions explicitly, and consider adding version checks or feature flags to manage API schema evolution safely.