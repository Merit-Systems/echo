# Semantic Cluster: Providers and Stream Handling (packages/app/server/src)

## Purpose
This cluster manages provider abstractions for various AI services (OpenAI, VertexAI, Gemini, Anthropic, XAI, Groq, etc.), focusing on request/response transformation, stream support, and URL signing. It encapsulates provider-specific logic, ensuring consistent interfacing, especially around streaming data and model pricing.

## Boundaries
- **Belongs here:** Provider classes (`OpenAIVideoProvider`, `VertexAIProvider`, `GeminiVeoProvider`, etc.), `BaseProvider` and its subclasses, request/response transformation functions (`transformRequestBody`, `transformResponse`), stream handling (`handleStream`, `duplicateStream`, `supportsStream`), URL signing (`generateSignedUrl`, `parseGcsUri`), and provider type identification (`getType`, `isVideoContentDownload`).
- **Does NOT belong here:** High-level API routing, external request orchestration, or storage management (handled by other clusters/services). Data models like `Transaction`, `LlmTransactionMetadata`, or `SupportedVideoModel` are referenced but managed elsewhere. UI or client-facing logic is outside scope.

## Invariants
- `getType()` must reliably return the correct `ProviderType` for each provider subclass; this is critical for downstream routing.
- `supportsStream()` must accurately reflect whether the provider supports streaming; inconsistent states can cause runtime errors.
- `duplicateStream()` must produce two independent streams without data loss or corruption; failure here breaks streaming guarantees.
- `transformRequestBody()` and `transformResponse()` must preserve data integrity, handle errors gracefully, and conform to expected formats.
- `generateSignedUrl()` must produce valid, unexpired URLs; invalid URLs lead to failed resource access.
- `parseGcsUri()` must correctly parse GCS URIs; malformed URIs should throw or handle errors explicitly.
- `handleStream()` must manage backpressure, errors, and resource cleanup; leaks or unhandled errors cause instability.
- `isVideoContentDownload()` must be accurate; misclassification affects downstream processing.
- `getApiKey()` can return `undefined`, but if provided, must be valid and authorized.
- `duplicateStream()` must not mutate original streams or cause side effects.
- Provider classes extending `BaseProvider` must implement all abstract methods; missing implementations lead to runtime errors.

## Patterns
- Use `getType()` as a discriminator for provider routing.
- Always check `supportsStream()` before invoking streaming methods; fallback to non-streaming logic if unsupported.
- When handling streams, use `duplicateStream()` to enable multiple consumers without data loss.
- Wrap external API calls with `try/catch`; propagate errors as `HttpError` or custom errors.
- Use `formatUpstreamUrl()` to construct provider-specific URLs, ensuring consistent upstream communication.
- Use `transformRequestBody()` and `transformResponse()` to normalize data formats; maintain idempotency.
- For signed URLs, parse URIs with `parseGcsUri()` before signing with `generateSignedUrl()`.
- When modifying request headers, use `formatAuthHeaders()` to inject authentication reliably.
- Follow naming conventions: methods like `getType()`, `isVideoContentDownload()`, `supportsStream()` are standard; avoid inconsistent naming.
- Use `handleBody()` for processing incoming request bodies, ensuring transaction consistency.
- When dealing with streaming responses, always invoke `handleStream()` with proper error handling.

## Pitfalls
- **Frequent modifications:** Methods like `getType()`, `isVideoContentDownload()`, and `duplicateStream()` are hot spots; avoid breaking existing contracts.
- **High coupling:** Changes in `BaseProvider` or its subclasses may ripple; ensure backward compatibility.
- **Stream handling errors:** Failing to properly duplicate or manage streams can cause data loss, leaks, or crashes.
- **Incorrect URL signing:** Misparsing URIs or using invalid credentials leads to inaccessible resources.
- **Inconsistent provider types:** Returning wrong `ProviderType` from `getType()` causes routing errors.
- **Churn in provider classes:** Frequent updates to provider subclasses (`OpenAIVideoProvider`, `GeminiVeoProvider`, etc.) require careful version control.
- **Null safety:** `getApiKey()` may return `undefined`; callers must handle absence gracefully.
- **Error propagation:** `handleStream()` and `processStreamData()` must handle all errors internally; unhandled exceptions cause instability.
- **Unsupported features:** Calling `supportsStream()` on providers that do not support streaming leads to runtime failures.
- **Resource leaks:** Not cleaning up streams or failing to handle backpressure in `handleStream()` can cause memory issues.

## Dependencies
- **External:** 
  - `Decimal` for precise cost calculations.
  - `TextDecoder` for decoding streamed data.
  - `pipeline` for stream piping and error handling.
  - `responses`, `route`, `tokens`, `transformations`, `video`, `videos` for various utilities.
- **Internal:** 
  - `HttpError` for error handling.
  - `formatUpstreamUrl()` for URL construction.
  - Provider classes (`GeminiGPTProvider`, `GPTProvider`, `AnthropicGPTProvider`, `OpenAIBaseProvider`, etc.) as base or related providers.
  - Data models (`Transaction`, `LlmTransactionMetadata`, `SupportedVideoModel`, etc.).
  - Services like `EchoControlService`, `HandleNonStreamingService`.
  - Storage utilities (`Storage`, `parseGcsUri()`, `generateSignedUrl()`).
- **Usage notes:** Always verify provider-specific behaviors (e.g., streaming support, URL signing) via their methods before invocation. Use `getType()` to route requests correctly. Maintain consistency in request/response transformations to avoid data corruption or protocol mismatches.

---

**Summary:**  
Agents working with this cluster must understand provider-specific contracts, especially around streaming support, URL signing, and request transformation. They must respect the invariants to prevent runtime failures, follow established patterns for data handling, and be vigilant about the frequent churn in core methods. Proper dependency management and error handling are critical to maintain stability and correctness.