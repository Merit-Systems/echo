# Semantic Cluster: Server Middleware and GPT Client Integration

## Purpose
This cluster manages request tracing enrichment via `trace-enrichment-middleware.ts`, handles GPT API interactions through `makeRequest`, and interfaces with the Gemini GPT client. It enables enriched request context propagation and external AI service communication within the server.

## Boundaries
- **Belongs here:** Middleware for trace enrichment, GPT request logic, client wrapper for Gemini GPT API.
- **Does NOT belong here:** UI components, frontend request handling, unrelated external APIs, or unrelated internal modules. Business logic unrelated to request tracing or GPT interactions should be elsewhere.

## Invariants
- `trace-enrichment-middleware.ts` must always attach consistent trace context to requests; do NOT omit or overwrite existing context.
- `makeRequest` must handle `useStreaming` flag correctly; streaming mode should be explicitly enabled and managed.
- All GPT requests via `gemini-gpt-client.ts` must include proper API keys, handle rate limits, and respect OpenAI's usage policies.
- `makeRequest` must never proceed with null/undefined parameters; enforce input validation.
- Resources (e.g., streams, connections) opened during GPT requests must be properly closed or cleaned up to prevent leaks.
- Request IDs and trace context must be propagated synchronously; asynchronous modifications risk losing context.

## Patterns
- Use consistent naming: `makeRequest`, `trace-enrichment-middleware`.
- Error handling: Catch and log errors explicitly; do not swallow exceptions silently.
- For `makeRequest`, prefer explicit boolean flags (`useStreaming`) over implicit assumptions.
- Middleware should attach trace info at the earliest point in the request lifecycle.
- External dependencies (`OpenAI`, `next`) must be imported and used according to their latest API specifications.
- When modifying `makeRequest`, preserve the pattern of returning a promise that resolves with the response or rejects with an error.
- Use environment variables or configuration files for API keys and endpoints; avoid hardcoding sensitive info.

## Pitfalls
- Frequently modified files (`trace-enrichment-middleware.ts`, `makeRequest`, `gemini-gpt-client.ts`) are prone to introducing regressions; test trace propagation and GPT request flows thoroughly.
- Mistakes in trace context propagation can lead to broken request tracing, making debugging difficult.
- In `makeRequest`, neglecting to handle streaming properly can cause resource leaks or incomplete data handling.
- Overlooking rate limits or API quota constraints in `gemini-gpt-client.ts` may cause request failures.
- Inconsistent error handling patterns can obscure root causes of failures.
- Modifying `useStreaming` without understanding its impact on downstream consumers can break data flow.
- Changes in external dependencies (`OpenAI`, `next`) require updating code to match new APIs; failure to do so causes runtime errors.
- High churn areas suggest frequent updates; extra caution needed to prevent introducing bugs during refactoring.

## Dependencies
- **OpenAI SDK:** Use latest API version; ensure API keys are securely managed via environment variables.
- **Next.js:** Leverage its request/response lifecycle for middleware; respect its data-fetching patterns.
- **Internal modules:** Maintain compatibility with existing trace context propagation and request handling conventions.
- **External APIs:** Follow rate limiting, quota, and error handling guidelines; implement retries if necessary.
- **Logging/Monitoring:** Integrate with existing observability tools to track errors and request flow, especially around `trace-enrichment-middleware.ts` and `makeRequest`.

---

**Note:** Always verify that modifications preserve existing invariants, especially around trace context integrity and GPT request correctness.