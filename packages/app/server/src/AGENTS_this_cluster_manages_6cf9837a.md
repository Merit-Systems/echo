# User Context and Utility Functions

## Purpose
This cluster manages user identification and model version checks within the server, providing core methods (`getUser`, `getUserId`, `isVeo3Model`) that underpin user-specific logic and feature toggles. It encapsulates logic for retrieving user data and determining model compatibility.

## Boundaries
- **Belongs here:** User data retrieval (`getUser`, `getUserId`), model version checks (`isVeo3Model`), and related utility functions in `utils.ts`.
- **Does NOT belong here:** Authentication flows, session management, or external API calls unrelated to user or model info. Those should be handled in dedicated auth or API modules.

## Invariants
- `getUser()` must return `null` if no user is authenticated; never throw exceptions.
- `getUserId()` must return a consistent string identifier or `null`; should not return empty strings.
- `isVeo3Model()` must reliably reflect the current model version; should cache results if performance is critical but invalidate on relevant updates.
- User data dependencies (e.g., from context or session) should be synchronized with the actual user state.
- Utility functions in `utils.ts` are frequently modified; avoid introducing side effects that could break invariants.

## Patterns
- Use explicit null checks; do not assume presence of user data.
- Follow naming conventions: `getUser`, `getUserId`, `isVeo3Model`.
- When modifying, preserve idempotency: `getUser()` should consistently return the same user object unless user state changes.
- Handle errors gracefully; avoid unhandled exceptions.
- Cache results of `isVeo3Model()` if performance is critical, but ensure cache invalidation aligns with model updates.
- Use dependency injection for external dependencies like `CdpClient` when extending functionality.

## Pitfalls
- Frequently modified functions (`getUser`, `getUserId`, `isVeo3Model`) are prone to regressions; ensure thorough testing.
- Null-safety: forget to handle `null` cases in consumer code leads to runtime errors.
- Assumptions about user presence can cause bugs; always check for `null`.
- Caching `isVeo3Model()` without proper invalidation can cause stale data.
- External dependencies (`amount`, `prefix`) are imported but not used here; ensure they are relevant or remove to avoid confusion.
- Avoid tight coupling with external user management; rely on the provided methods.

## Dependencies
- **User** entity: must be correctly structured and available in context.
- **CdpClient**: external API client; use carefully, especially regarding asynchronous calls or side effects.
- **amount**, **prefix**: utility functions or constants; ensure their usage aligns with current code patterns.
- **utils.ts**: contains auxiliary functions; modifications should preserve existing invariants and patterns.

---

**Summary:**  
This cluster provides foundational user and model version info critical for feature gating and user-specific logic. AI agents must understand the null-safety contracts, caching considerations, and the scope of data dependencies. Careful handling of modifications, especially around frequently changing methods, is essential to maintain stability.