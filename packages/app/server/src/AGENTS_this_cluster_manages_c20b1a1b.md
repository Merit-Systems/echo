# Semantic Cluster: GPT Provider and Streaming Parsing (packages/app/server/src)

## Purpose
This cluster manages multiple GPT provider implementations (OpenAI, Anthropic, Gemini), handles streaming response parsing, and computes token costs. It encapsulates provider-specific logic, response handling, and format parsing, enabling flexible, multi-provider LLM interactions with robust streaming support.

## Boundaries
- **Belongs here:** Provider classes (`GPTProvider`, `AnthropicGPTProvider`, `GeminiGPTProvider`), response parsing functions (`parseSSEGPTFormat`, `parseSSEAnthropicGPTFormat`, `parseSSEGeminiFormat`, etc.), `handleBody` methods, token cost calculations (`getCostPerToken`), and related interfaces (`StreamingChunkBody`, `Transaction`, `TransactionMetadata`, etc.).
- **Does NOT belong here:** UI components, client-side streaming management, high-level orchestration outside provider context, or unrelated domain logic. Infrastructure concerns like network transport, auth, or logging are outside scope unless directly invoked here.

## Invariants
- `handleBody` methods must always return a `Transaction` object; handle errors gracefully, do not throw unhandled exceptions.
- Streaming data formats (SSE) must be parsed with their respective functions; mismatched formats lead to null or errors.
- `super()` calls in provider classes must match the expected constructor signatures; frequent modifications to `super()` imply fragile inheritance chains.
- Token cost calculations via `getCostPerToken` must consider model-specific pricing; invalid models should trigger `UnknownModelError`.
- Response parsing functions (`parseSSE*Format`) must produce consistent `StreamingChunkBody` objects; malformed data should result in null or handled errors.
- `getApiKey()` must return undefined if no key is configured; avoid nulls.
- All provider classes extend `OpenAIBaseProvider`, inheriting its contract; ensure overridden methods conform to expected behavior.

## Patterns
- Use `async handleBody(data: string)` consistently for streaming response handling; always return a `Transaction`.
- Parsing functions follow a pattern: receive raw string, parse into structured objects, handle errors internally, return arrays or null.
- `super()` calls are frequently versioned; maintain correct constructor signatures and document version dependencies.
- Token cost calculation via `getCostPerToken` is externalized; always pass correct model identifiers and token counts.
- Provider classes implement `getType()` returning a `ProviderType`; ensure correct enum usage.
- Interfaces define clear contracts; implementers must adhere to `TransactionMetadata` extensions.
- Use `getApiKey()` to retrieve credentials; handle undefined safely.
- Modularize parsing logic per format (`SSEGPT`, `SSEAnthropicGPT`, `SSEGemini`) to isolate format-specific quirks.
- Maintain strict null-safety and validation in response parsing to avoid downstream errors.

## Pitfalls
- **Frequent `super()` modifications:** Risk of constructor signature mismatches; verify all subclasses call `super()` with correct parameters.
- **Churn in `LlmTransactionMetadata`:** High dependency count increases risk of inconsistent metadata handling; ensure all consumers correctly interpret metadata.
- **`getCostPerToken` reliance:** Heavy external dependency; incorrect model names or token counts can produce inaccurate costs, affecting billing logic.
- **Streaming format parsing:** Mismatched or malformed SSE data can cause silent failures or incorrect `StreamingChunkBody` objects; validate data before parsing.
- **Response handling in `handleBody`:** Failure to handle exceptions or unexpected data formats can crash or produce invalid transactions.
- **Versioned `super()` calls:** Frequent modifications suggest fragile inheritance; avoid unnecessary changes and document version dependencies.
- **High coupling with external modules:** Calls to `logMetric`, `UnknownModelError`, `isValidModel`, `getModelPrice` imply tight coupling; ensure these are stable and correctly used.
- **Churn hotspots:** Frequent updates to `super()` and `LlmTransactionMetadata` indicate areas prone to regressions; test thoroughly when modifying.
- **Error propagation:** Avoid unhandled errors in parsing and response handling; always catch and log errors internally.

## Dependencies
- **External:** `Decimal`, `array`, `tokens` for precise calculations, array manipulations, and token management.
- **Internal references:** 
  - `Transaction` (core data structure for responses)
  - `handleBody` (response handler pattern)
  - `getBaseUrl`, `logMetric`, `UnknownModelError`, `isValidModel`, `getModelPrice` (utility functions for metrics, validation, pricing)
  - `OpenAIBaseProvider` (base class for providers)
  - `TransactionMetadata` and extensions (`VeoTransactionMetadata`, `LlmTransactionMetadata`) for metadata handling.
- **Dependencies of this cluster:** 
  - References `Transaction` and related metadata interfaces.
  - Calls `handleBody`, `getBaseUrl`, `logMetric`, `UnknownModelError`, `isValidModel`, `getModelPrice`.
  - Extends `OpenAIBaseProvider`.
- **Dependent on by:** 
  - Higher-level routing or orchestration modules (`trpc/routers/user/index.ts`), other provider-specific modules (`AnthropicNativeProvider`), and utility functions (`createBuckets`, `isLlmTransactionMetadata`, `isVeoTransactionMetadata`).

---

**Summary:**  
This cluster encapsulates provider-specific streaming response handling, format parsing, and token cost calculation. Agents must respect constructor invariants, handle streaming formats robustly, and be aware of frequent `super()` modifications. External dependencies for metrics, validation, and pricing are critical; misusing them risks incorrect billing or unstable behavior. Maintain strict adherence to response contracts, parsing patterns, and error handling to ensure stability amidst high churn areas.