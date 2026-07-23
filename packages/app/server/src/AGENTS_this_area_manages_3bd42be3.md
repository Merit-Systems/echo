# Access Token Retrieval and Tracing Utilities

## Purpose
This area manages obtaining Google OAuth access tokens via `getAccessToken()` and integrates tracing capabilities from `packages/app/server/src/utils/trace.ts`. It enables authenticated API calls and observability, crucial for secure interactions and debugging.

## Boundaries
- **Belongs here:**  
  - Logic for acquiring and caching GoogleAuth tokens  
  - Trace initialization, span creation, and context propagation within `trace.ts`  
- **Does NOT belong here:**  
  - Business logic unrelated to authentication or tracing (e.g., data processing, UI rendering)  
  - External API calls outside GoogleAuth scope  
  - Token storage or refresh mechanisms beyond `getAccessToken()` scope  
  - Trace configuration or setup code that isn't invoked within this module

## Invariants
- `getAccessToken()` must always return a valid, non-expired token string; handle token refresh internally if needed.  
- `getAccessToken()` must never return null, undefined, or an invalid token string.  
- Tracing spans created via `trace.ts` must be correctly closed to avoid memory leaks.  
- Trace context must propagate correctly across asynchronous boundaries to ensure accurate trace data.  
- External `GoogleAuth` instance must be initialized before calling `getAccessToken()`.  
- No assumptions about token cache invalidation timing; handle token expiry explicitly if caching is implemented.

## Patterns
- Use `async/await` consistently for asynchronous operations in `getAccessToken()`.  
- Error handling: propagate errors explicitly; do not swallow exceptions.  
- Naming conventions:  
  - Method: `getAccessToken` (camelCase, verb-noun)  
  - Module: `trace.ts` (descriptive, lowercase with dots)  
- Trace spans should be created with clear start/end boundaries, using context-aware APIs.  
- External `GoogleAuth` should be imported and instantiated once; avoid re-initialization.  
- Prefer explicit null/undefined checks over implicit truthiness.

## Pitfalls
- Frequent modifications to `getAccessToken` increase risk of introducing token refresh bugs or caching issues.  
- Mismanaging trace spans (not closing or propagating context) leads to incomplete traces.  
- Relying on uninitialized `GoogleAuth` causes runtime errors.  
- Forgetting to handle token expiry or refresh logic results in invalid tokens being used.  
- External dependencies (GoogleAuth) may have version-specific behaviors; ensure compatibility.  
- Churn in `trace.ts` suggests potential instability; avoid making unrelated changes that could break tracing.

## Dependencies
- **GoogleAuth:**  
  - Use as a singleton; initialize once at module load.  
  - Ensure proper scope and credentials are configured before calling `getAccessToken()`.  
  - Handle potential errors during token fetch (e.g., network issues, permission errors).  
- **trace.ts:**  
  - Use exported functions for span creation and context propagation.  
  - Maintain consistent trace context across async boundaries to preserve trace integrity.  
- **Error Handling:**  
  - Fail gracefully; log errors without crashing.  
  - Consider retry logic if token fetch fails repeatedly.