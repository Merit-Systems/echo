# GPT Client and OpenRouterProvider Integration

## Purpose
This cluster manages the interaction with OpenAI's API via the `gpt-client.ts` module, primarily through the `makeRequest` function, and the configuration/provider setup in `OpenRouterProvider.ts`. It encapsulates request handling, streaming options, and provider configuration necessary for AI-powered features.

## Boundaries
- **Belongs here:** 
  - All logic related to constructing, sending, and receiving GPT API requests within `makeRequest`.
  - Provider setup, including API keys, endpoints, and configuration in `OpenRouterProvider.ts`.
- **Does NOT belong here:** 
  - Business logic unrelated to GPT API interactions (e.g., user management, UI).
  - Data persistence or caching mechanisms outside the scope of request handling.
  - External API integrations other than OpenAI.

## Invariants
- `makeRequest` must always handle `useStreaming` boolean explicitly; default is `false`.
- API requests must include proper authentication headers; missing or invalid keys should trigger errors.
- Streaming responses, if enabled, must be processed incrementally without losing data integrity.
- `OpenRouterProvider` must supply a valid configuration object before any request is made.
- No request should proceed if the provider configuration is invalid or incomplete.
- All API responses should be validated for expected structure; malformed responses must trigger error handling.
- Resource cleanup (e.g., abort controllers) must be handled to prevent leaks during streaming or retries.

## Patterns
- Use consistent naming: `makeRequest`, `OpenRouterProvider`.
- Error handling: catch and propagate errors explicitly; do not swallow.
- Streaming: handle `useStreaming` flag to switch between full response and incremental data.
- Configuration: `OpenRouterProvider` should expose a singleton or factory pattern ensuring a single source of truth.
- Request retries: implement idempotent retries with exponential backoff if applicable.
- Use environment variables or secure storage for API keys; avoid hardcoding.
- Validate input parameters (`useStreaming`) before request execution.
- Maintain clear separation: request construction, execution, and response parsing.

## Pitfalls
- Frequent modifications in `gpt-client.ts` and `makeRequest` increase risk of breaking request invariants; ensure thorough testing.
- Mismanaging streaming: not handling partial data or not aborting streams properly can cause leaks or inconsistent state.
- Hardcoded API keys or endpoints in `OpenRouterProvider.ts` can lead to security issues or misconfiguration.
- Forgetting to validate provider configuration before requests can cause runtime errors.
- Churn in core modules suggests instability; avoid making breaking changes without comprehensive tests.
- Overlooking error propagation from OpenAI responses may result in silent failures.
- Not respecting rate limits or API quotas can cause request failures; implement throttling if necessary.

## Dependencies
- **OpenAI SDK:** Use the official OpenAI package for request formatting and response parsing.
- **Configuration Management:** Ensure `OpenRouterProvider.ts` supplies correct API keys and endpoint URLs.
- **Error Handling Libraries:** Use consistent error classes or handling patterns for API errors.
- **Environment Variables:** Securely load API keys and sensitive configs; avoid hardcoded secrets.
- **Streaming Support:** Handle Node.js streams or fetch API's streaming capabilities as per environment.

---

**Note:** Always verify the latest API specifications and provider configurations, as frequent churn indicates evolving requirements or refactoring.