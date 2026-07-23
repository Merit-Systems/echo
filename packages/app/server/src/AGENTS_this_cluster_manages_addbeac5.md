# Semantic Cluster: Server Services and Client Integration

## Purpose
This cluster manages server-side interactions with the Anthropic API, specifically encapsulating the logic for making streaming and non-streaming requests via the `makeRequest` function, and providing a `FreeTierService` that likely orchestrates usage limits or billing logic related to these interactions.

## Boundaries
- **Belongs here:**  
  - All logic related to constructing, sending, and handling responses from the Anthropic API within `anthropic-client.ts`.  
  - Business logic managing free tier constraints or quotas within `FreeTierService.ts`.  
  - The `makeRequest` function's implementation details, including streaming behavior and error handling.  
- **Does NOT belong here:**  
  - Client-side UI logic or presentation code.  
  - Authentication mechanisms for the API (unless embedded in the client).  
  - External data storage or caching layers—these should be abstracted or handled outside this cluster.  
  - Other service integrations unrelated to Anthropic or free tier management.

## Invariants
- `makeRequest` must always handle the `useStreaming` boolean explicitly, defaulting to `true`.  
- Response handling in `makeRequest` must correctly process streaming vs. non-streaming responses without resource leaks.  
- `FreeTierService` should not exceed API quotas; enforce limits before making requests.  
- All API calls via `anthropic-client.ts` must include necessary authentication headers or tokens, assumed to be configured externally.  
- Null or undefined responses from the API must be gracefully handled, with proper error propagation or fallback logic.  
- The code must maintain idempotency where applicable, especially in quota checks and request retries.

## Patterns
- Use explicit boolean flags (`useStreaming`) to control request modes; avoid implicit assumptions.  
- Follow consistent naming conventions: `makeRequest`, `FreeTierService`, `anthropic-client`.  
- Error handling should be explicit, catching API errors, network failures, and streaming errors; do not rely on silent failures.  
- When modifying `makeRequest`, respect the streaming pattern: process chunks as they arrive, and close streams properly.  
- Encapsulate API request logic within `anthropic-client.ts`; do not duplicate request setup elsewhere.  
- Maintain clear separation of concerns: `FreeTierService` handles quota logic, `anthropic-client.ts` handles API communication.

## Pitfalls
- Modifying `makeRequest` without updating error handling or stream management can cause resource leaks or inconsistent states.  
- Changing the default `useStreaming` flag without considering downstream effects may break consumers expecting streaming responses.  
- Overlooking quota enforcement in `FreeTierService` can lead to exceeding free tier limits, causing billing issues or API throttling.  
- Ignoring external dependencies (e.g., Anthropic) version updates may introduce incompatibilities; monitor dependency changelogs.  
- Frequent modifications to `FreeTierService.ts`, `anthropic-client.ts`, and `makeRequest` suggest these are fragile; changes should be tested thoroughly, especially around error paths.  
- Not handling null or unexpected API responses can cause runtime errors; always validate responses before processing.

## Dependencies
- **External:**  
  - `Anthropic` SDK: Ensure correct usage per version; handle API key management securely.  
- **Internal:**  
  - `FreeTierService`: Use it to check and enforce quota limits before making API requests.  
  - `anthropic-client.ts`: Use the exported client functions to send requests; do not reimplement request logic.  
- **Usage:**  
  - Always initialize `makeRequest` with the correct `useStreaming` flag based on context.  
  - Confirm quota availability via `FreeTierService` before invoking `makeRequest`.  
  - Handle streaming responses asynchronously, respecting backpressure and chunk processing.