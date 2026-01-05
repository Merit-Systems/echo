# Packages/app/server/src/clients

## Purpose
Encapsulates client-side logic for interacting with external AI models via the OpenRouter API, providing request handling, model selection, and streaming support to facilitate server communication with AI services.

## Boundaries
- **Belongs:**  
  - `makeRequest`: core request logic, including streaming control and request configuration  
  - `getRandomModel`: logic for selecting a default or random model  
  - `openrouter-client.ts`: configuration, API endpoints, and client setup specific to OpenRouter API  
- **Does NOT belong:**  
  - Business logic unrelated to API communication (e.g., user management, UI handling)  
  - Internal server logic outside client API calls (e.g., database operations, auth)  
  - External integrations beyond OpenAI/OpenRouter (e.g., other AI providers)

## Invariants
- `makeRequest` must always handle errors gracefully, ensuring no unhandled promise rejections or silent failures.  
- When `useStreaming` is true, `makeRequest` must correctly process and forward streamed data chunks; when false, it should handle complete responses.  
- `getRandomModel` must return a valid, supported model string; invalid models should be avoided or fallback mechanisms used.  
- The module `packages/app/server/src/clients/openrouter-client.ts` must be initialized with correct API credentials and endpoint URLs before use.  
- No assumptions about the response structure should be made outside documented API contracts; validation is required.

## Patterns
- Use explicit default parameters (`useStreaming = false`) in `makeRequest`.  
- Follow consistent naming conventions: `makeRequest`, `getRandomModel`, and the module name.  
- Handle errors with try-catch blocks; propagate errors with meaningful messages.  
- When modifying `makeRequest`, ensure that streaming and non-streaming modes are mutually exclusive and correctly managed.  
- Use `getRandomModel` to select models from a predefined list or API-supported models, avoiding hardcoded unsupported models.  
- Maintain idempotency in `getRandomModel`—return consistent results unless underlying model list changes.  
- Document assumptions about external dependencies (e.g., OpenAI) and ensure correct import/use patterns.

## Pitfalls
- Frequent modifications to `makeRequest` increase risk of inconsistent request configurations or streaming mishandling.  
- Hardcoding model names in `getRandomModel` can lead to unsupported models; prefer dynamic retrieval if possible.  
- Forgetting to handle streaming data correctly in `makeRequest` can cause data loss or incomplete responses.  
- Not validating API credentials or endpoint URLs in `openrouter-client.ts` may cause runtime failures.  
- Overlooking error propagation or mismanaging exceptions can lead to unhandled promise rejections.  
- Changes in external dependencies (OpenAI) API or SDK may require updates in request handling logic.

## Dependencies
- **OpenAI SDK:**  
  - Use according to official documentation. Ensure API keys are securely stored and correctly injected.  
  - Validate API response schemas before processing.  
- **Configuration:**  
  - Confirm API endpoint URLs and credentials are correctly set in `openrouter-client.ts`.  
- **Model support:**  
  - `getRandomModel` relies on supported models; keep this list updated with available models from OpenRouter/OpenAI.  
- **Error handling:**  
  - Implement robust try-catch blocks around API calls to handle network issues, rate limits, or invalid responses.  
- **Streaming support:**  
  - When `useStreaming` is true, ensure the client properly subscribes to data streams and handles partial data.  
- **Churn awareness:**  
  - Be cautious with frequent modifications to core functions; document changes thoroughly to prevent regressions.