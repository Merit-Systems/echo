# Providers (packages/app/server/src/providers)

## Purpose
This cluster encapsulates provider modules for interfacing with different GPT-based services, specifically GeminiGPT and AnthropicGPT. It abstracts API interactions, enabling flexible integration of multiple LLM providers within the application.

## Boundaries
- **Belongs here:** Implementation details of GeminiGPTProvider and AnthropicGPTProvider, including API request construction, response parsing, and error handling.
- **Does NOT belong here:** Core application logic, user interface components, or data storage mechanisms. Providers should not handle state management beyond request/response cycles or implement business rules.

## Invariants
- Each provider must implement a consistent interface (e.g., `sendPrompt()`) to ensure interchangeability.
- API requests must include necessary authentication tokens, which should be securely managed and not hardcoded.
- Responses must be validated for expected structure; null or malformed responses should trigger retries or error propagation.
- No provider should leak sensitive data; ensure proper sanitization and secure handling of API keys.
- Request ordering and concurrency controls are critical if providers are used in parallel; avoid race conditions and ensure thread safety if applicable.
- Churn in provider modules (notably GeminiGPTProvider and AnthropicGPTProvider) is high; expect frequent updates to API endpoints, request schemas, or response formats.

## Patterns
- Use consistent naming conventions for methods (`sendPrompt`, `initialize`, `shutdown`).
- Error handling should follow a pattern: catch exceptions, log detailed context, and propagate meaningful errors.
- API interactions should be abstracted into helper functions or classes to facilitate testing and mocking.
- Configuration (API keys, endpoints) should be injected via environment variables or configuration files, not hardcoded.
- Asynchronous operations should utilize promises or async/await with proper error catching.
- Maintain clear separation between request construction, response parsing, and error handling logic.

## Pitfalls
- **Frequent modifications:** GeminiGPTProvider and AnthropicGPTProvider are highly volatile; avoid assumptions about fixed API schemas.
- **Churn risk:** Changes in provider APIs can break request/response handling; implement robust validation and versioning.
- **Null-safety:** Responses may be null or incomplete; always validate before use.
- **Concurrency issues:** If multiple requests are processed simultaneously, ensure thread safety and avoid shared mutable state.
- **Misconfiguration:** Incorrect API keys or endpoints can cause silent failures; enforce validation on startup.
- **Error handling gaps:** Unhandled exceptions can crash request cycles; implement comprehensive try-catch blocks.
- **Resource leaks:** Ensure proper cleanup if providers maintain persistent connections or caches.

## Dependencies
- **External APIs:** GeminiGPT and AnthropicGPT APIs must be used according to their latest specifications; monitor for updates.
- **Secure storage:** Use environment variables or secret management tools for API keys.
- **Logging:** Implement detailed logging for request/response cycles to facilitate debugging, especially given high churn.
- **Testing frameworks:** Mock provider modules to simulate different API responses and error conditions, ensuring robustness against frequent changes.
- **Configuration management:** Properly load and validate provider-specific settings to prevent runtime errors.

---

**Note:** Given the high churn and frequent updates, agents should prioritize flexible, version-aware request handling and maintain close monitoring of provider API changes to adapt swiftly.