# Semantic Cluster: Request Handling & GPT Integration (packages/app/server/src)

## Purpose
This cluster manages the core logic for making external API requests, specifically to the VEO3 client and GPT providers, facilitating video generation workflows and AI interactions. It encapsulates request construction, execution, and response handling, abstracting external service communication.

## Boundaries
- **Belongs here:**
  - `makeRequest()` implementation, including request setup, retries, error handling.
  - VEO3 client interactions (`veo3-client.ts`) for video-related API calls.
  - GPTProvider logic for AI prompt management and response parsing.
  - External dependencies `GenerateVideosOperation` and `GoogleGenAI` for video generation and AI services.
- **Does NOT belong here:**
  - UI logic, user input validation, or frontend-specific code.
  - Data persistence or database interactions.
  - Authentication, authorization, or security concerns outside request context.
  - Other service integrations unrelated to request execution or GPT/Video APIs.

## Invariants
- `makeRequest()` must always handle errors gracefully, implementing retries or fallback strategies.
- Requests to `VEO3` and `GoogleGenAI` must include necessary authentication tokens, never omitted.
- Responses must be validated for expected structure; invalid responses should trigger explicit errors.
- `makeRequest()` should not mutate shared state; it must be stateless or manage internal state carefully.
- External API calls should respect rate limits; implement throttling if necessary.
- Null-safety: responses and parameters must be checked for null/undefined before processing.
- Order of operations: request setup → send → validate response → handle errors.

## Patterns
- Use consistent naming conventions: `makeRequest()` as the core request executor, `VEO3Client`, `GPTProvider`.
- Error handling: catch exceptions, log detailed context, and propagate meaningful errors.
- Asynchronous flow: always `await` API calls; handle promise rejections explicitly.
- Request configuration: separate request construction from execution; use helper functions if needed.
- Modular design: keep `makeRequest()` generic, configurable for different endpoints and payloads.
- Use environment variables or config files for API keys/tokens, never hardcoded.
- Response validation: check for expected properties; throw descriptive errors if invalid.
- Churn-sensitive code: avoid complex logic inside `makeRequest()`; prefer simple, repeatable patterns.

## Pitfalls
- Frequently modified `makeRequest()` risks introducing inconsistent error handling or request logic.
- Hardcoded API tokens or endpoints can cause security issues or bugs during environment changes.
- Neglecting response validation may lead to downstream errors or data corruption.
- Ignoring rate limits or retries can cause request failures or API bans.
- Coupling between `veo3-client.ts` and `GPTProvider.ts` may lead to tight dependencies, reducing flexibility.
- Not handling null/undefined responses can cause runtime exceptions.
- Overloading `makeRequest()` with multiple responsibilities (e.g., logging, retries, response parsing) increases churn and complexity.

## Dependencies
- **GenerateVideosOperation:** Use for orchestrating video generation workflows; ensure correct invocation and response handling.
- **GoogleGenAI:** Leverage for AI prompt processing; manage API keys securely, handle rate limits.
- **External APIs:** Respect rate limits, handle network errors, validate responses.
- **Configuration:** Use environment variables for API keys, endpoints, timeouts.
- **Logging & Monitoring:** Instrument `makeRequest()` to capture request durations, failures, and retries for observability.

---

**Note:** Focus on maintaining stateless, retryable, and validated request logic. Be vigilant about frequent modifications, ensuring consistent error handling and response validation to prevent subtle bugs.