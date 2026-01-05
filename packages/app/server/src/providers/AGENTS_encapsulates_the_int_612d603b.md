# AnthropicNativeProvider.ts

## Purpose
Encapsulates the integration with Anthropic's native API, managing prompt submission, response retrieval, and token handling. It provides a specialized interface for interacting with Anthropic models within the server environment, abstracting API details and ensuring consistent request/response handling.

## Boundaries
- **Belongs here:** All logic related to constructing requests, managing API keys, handling responses, and token counting for Anthropic models.
- **Does NOT belong here:** Any logic related to other LLM providers, general request routing, or application-specific business logic unrelated to Anthropic API interactions. Utility functions or shared helpers should reside elsewhere.

## Invariants
- API keys must be securely stored and retrieved; never hardcoded.
- Requests must include required parameters (e.g., model name, prompt, temperature).
- Responses must be validated for expected structure; handle errors gracefully.
- Token counting must be accurate; avoid exceeding model token limits.
- The provider must handle rate limits and retries according to Anthropic's API specifications.
- Null or undefined responses from the API should trigger explicit error handling.
- Churn-prone: Be cautious when modifying request/response schemas; ensure backward compatibility.

## Patterns
- Use consistent naming conventions: e.g., `sendPrompt()`, `parseResponse()`.
- Error handling should follow the pattern of catching exceptions, logging, and propagating meaningful errors.
- API interactions should be asynchronous, returning Promises.
- Token counting should leverage existing utilities, ensuring consistency.
- Configuration (e.g., API URL, timeout) should be centralized and environment-driven.
- Maintain clear separation between request construction, response parsing, and error handling.

## Pitfalls
- Frequent modifications increase risk of breaking token limits or request formats.
- Hardcoding API keys or sensitive data introduces security risks.
- Ignoring rate limits can cause request failures or bans.
- Mismanaging null/undefined responses leads to runtime errors.
- Changes in the Anthropic API (e.g., endpoint updates, parameter changes) require careful version tracking.
- Overlooking token counting inaccuracies may cause prompt truncation or API errors.
- Be vigilant about concurrency issues if multiple requests are handled simultaneously.

## Dependencies
- Token counting utilities: Ensure they are accurate and compatible with Anthropic models.
- Environment variables/configuration management: For API keys and endpoints.
- Logging framework: For error reporting and debugging.
- Error handling utilities: To standardize API error responses.
- (Optional) Retry logic libraries: To handle transient API failures gracefully.

---

**Note:** Given the high churn rate, maintain thorough version control and document API schema changes. Regularly review external API documentation for updates affecting request/response formats.