# Gemini Stream Extraction and Completion State Interface

## Purpose
This area manages the detection of Gemini stream requests via `extractGeminiIsStream` and defines the `CompletionStateBody` interface for handling completion state payloads. It enables the server to interpret specific request patterns and structure completion data accordingly.

## Boundaries
- **Belongs here:** Logic for identifying Gemini stream requests (`extractGeminiIsStream`), data shape for completion states (`CompletionStateBody`).
- **Does NOT belong here:** Request parsing unrelated to Gemini streams, response formatting, or broader request handling logic; these should be handled in other modules or middleware.

## Invariants
- `extractGeminiIsStream(req)` must reliably return `true` only if the request explicitly indicates a Gemini stream request, based on specific headers or parameters (not shown but implied).
- `CompletionStateBody` must accurately reflect the server's completion state; properties should be non-null unless explicitly optional.
- The interface should be stable; avoid adding or removing properties without versioning or clear migration paths.
- Null-safety: All non-optional properties must be initialized; optional properties may be omitted.
- No side effects: `extractGeminiIsStream` is a pure function, with no external state mutation.

## Patterns
- Naming conventions: Use `extractGeminiIsStream` for request pattern detection; interface names should be descriptive (`CompletionStateBody`).
- Error handling: Assume `extractGeminiIsStream` returns `false` if request lacks required headers or parameters; do not throw exceptions.
- Interface design: Keep `CompletionStateBody` simple; avoid complex nested structures unless necessary.
- Versioning: Since both entities are frequently modified, document version changes explicitly; avoid breaking changes.

## Pitfalls
- Frequent modifications to `extractGeminiIsStream` suggest potential instability; ensure all callers handle `false` gracefully.
- `CompletionStateBody` may evolve; avoid assumptions about property presence unless marked optional.
- Null safety: Missing null checks can cause runtime errors; enforce strict property initialization.
- Misinterpreting request signals: Rely on correct header/parameter checks within `extractGeminiIsStream`.
- Overloading the interface with optional properties can lead to inconsistent data handling.

## Dependencies
- No external dependencies are directly used; however, `Request` must conform to expected structure (e.g., Express.js Request).
- Ensure request parsing (headers, query params) within `extractGeminiIsStream` aligns with server conventions.
- Maintain consistency with request and response handling patterns elsewhere in the codebase.

---

**Note:** Given the high churn of both entities, document their version history and intended stability. Avoid making breaking changes without coordinated updates.