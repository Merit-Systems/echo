# Mock Response and Headers Utilities (packages/app/server/src/__tests__)

## Purpose
Provides utility functions to generate mock responses, headers, and streaming responses for testing server-side API interactions, particularly with AI model responses and control services.

## Boundaries
- **Belongs here:** Functions creating mock responses (`createMockNonStreamingResponse`, `createMockAnthropicResponse`, `createMockStreamingResponse`, `createMockAnthropicStreamingResponse`), mock headers (`createMockHeaders`), and setup for echo control service (`setupMockEchoControlService`).
- **Does NOT belong here:** Actual production response handling, real network request logic, or integration with real services. These are strictly for testing and mocking.

## Invariants
- Mock response functions must accept `content` and `totalTokens`, with `totalTokens` defaulting to 10.
- Streaming responses (`createMockStreamingResponse`, `createMockAnthropicStreamingResponse`) must return a `ReadableStream` that emits the provided `content`.
- `createMockHeaders` must produce a headers array compatible with fetch API expectations.
- `setupMockEchoControlService` initializes the mocked echo control service with a default or specified `balance`.
- All mock functions should be deterministic and produce consistent outputs for given inputs.
- Mocked responses should not accidentally include real network calls; they are purely in-memory constructs.
- Churn is high; frequent modifications suggest evolving test needs or response formats.

## Patterns
- Use consistent parameter naming: `content`, `totalTokens`, `headers`, `balance`.
- Streaming responses should utilize `ReadableStream` with proper chunking.
- Mock responses should mimic real API responses closely, including headers and token counts.
- Setup functions (`setupMockEchoControlService`) should initialize shared state reliably before tests.
- Maintain clear separation between mock creation functions and setup functions.
- Follow naming conventions: functions prefixed with `createMock` for response mocks, `setupMock` for setup routines.
- Error handling is minimal; assume inputs are valid, but document if invalid inputs are possible.

## Pitfalls
- Frequent modifications increase risk of inconsistent mock behaviors; document expected response structures.
- Churned functions like `createMockNonStreamingResponse` and streaming variants are prone to divergence; ensure they stay aligned.
- Over-reliance on default `totalTokens` may cause test inaccuracies if token counts are critical.
- Streaming responses must correctly implement backpressure and chunk emission; improper implementation leads to flaky tests.
- Be cautious with `setupMockEchoControlService`; improper initialization can cause state leakage between tests.
- Avoid mixing real network calls with mocks; ensure all dependencies are properly mocked.
- Null safety: ensure all mock functions handle empty or null `content` gracefully if such cases are tested.

## Dependencies
- **External Modules:**
  - `MockedEchoControlService`: used to initialize the echo control state; must be correctly instantiated and reset per test.
  - `Provider`: for dependency injection if used elsewhere.
  - `ReadableStream`: for creating streaming mock responses; ensure compatibility with test environment.
  - `TextEncoder`: for encoding string content into stream chunks.
- **Internal:**
  - `request`: mock or stubbed request function, used to simulate network calls if needed.
- **Usage notes:**
  - Always call `setupMockEchoControlService` before tests that depend on echo control state.
  - Use `createMockHeaders` to generate headers that match expected API responses.
  - For streaming responses, verify chunk emission timing and content integrity.
  - Maintain consistency in token count calculations if tests depend on `totalTokens`.

---

**Note:** Given the high churn, keep documentation updated with each change to ensure test reliability and clarity for future modifications.