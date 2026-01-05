# Echo App and User GCS URI Management

## Purpose
This cluster manages retrieval of EchoApp entities by ID and constructs Google Cloud Storage URIs for user-specific data, enabling consistent access patterns and data referencing within the server.

## Boundaries
- **Belongs here:** 
  - Retrieval of EchoApp data via `getEchoAppById`.
  - Construction of user-specific GCS URIs via `buildUserGcsUri`.
- **Does NOT belong here:** 
  - Data persistence logic for EchoApp (handled elsewhere).
  - Authentication, authorization, or access control.
  - GCS bucket configuration or environment setup.
  - Other resource URI schemes or cloud storage providers.

## Invariants
- `getEchoAppById` must return `null` if no matching EchoApp exists; never throw or return undefined.
- `buildUserGcsUri` must encode `userPath` with `encodeURIComponent` to ensure URI safety.
- The constructed URI from `buildUserGcsUri` should always follow a consistent pattern, e.g., `gs://<bucket>/<userId>/<encodedUserPath>`.
- User IDs and paths used in `buildUserGcsUri` must be validated for non-empty, non-null strings before invocation.
- `getEchoAppById` should cache results if used frequently, but cache invalidation is outside this scope.
- No side effects are expected; methods are pure or rely solely on provided parameters.

## Patterns
- Use `encodeURIComponent` for all userPath segments in `buildUserGcsUri`.
- Handle null or invalid `echoAppId` gracefully, returning `null` if not found.
- Follow consistent naming conventions: `getEchoAppById`, `buildUserGcsUri`.
- Maintain asynchronous pattern in `getEchoAppById`; ensure proper await/async handling.
- Document assumptions about `EchoApp` shape externally; code assumes existence of such type.
- Avoid side effects; methods should be deterministic given inputs.
- Use explicit null checks and validation for input parameters.

## Pitfalls
- **Frequent modifications** of both methods suggest instability; avoid assumptions about their internal logic.
- **Null safety:** `getEchoAppById` may return `null`; callers must handle this.
- **URI encoding:** Failing to encode `userPath` in `buildUserGcsUri` risks invalid URIs.
- **Parameter validation:** Passing empty or malformed IDs/paths can produce invalid results.
- **Churn risk:** Changes in URI structure or EchoApp retrieval logic may break downstream consumers.
- **No dependency on external cache or state:** Rely solely on parameters; avoid implicit dependencies.
- **Concurrency considerations:** If used in high-concurrency contexts, ensure thread safety if caching is introduced later.

## Dependencies
- **encodeURIComponent:** Use correctly to encode `userPath` segments in `buildUserGcsUri`.
- No external dependencies are explicitly required for `getEchoAppById`; assume database or data source access is abstracted.
- Ensure environment provides necessary configuration for URI construction (e.g., bucket name), if applicable, outside this scope.

---

**Note:** Always verify that `getEchoAppById` handles errors internally or propagates exceptions appropriately. For `buildUserGcsUri`, confirm that inputs are sanitized before use to prevent injection or malformed URIs.