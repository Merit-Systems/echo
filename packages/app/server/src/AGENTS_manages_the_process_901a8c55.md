# Video URI Transformation in Server Package

## Purpose
Manages the process of transforming video URIs within the server environment, specifically converting or processing video references using the `transformVideoUri` method and handling associated storage interactions.

## Boundaries
- **Belongs here:** All logic related to URI transformation, storage referencing, and related data handling for videos.
- **Does NOT belong here:** UI rendering, client-side video handling, or unrelated data processing. Storage module implementations should reside elsewhere; only references are used here.

## Invariants
- `transformVideoUri` must always await the completion of storage interactions before proceeding.
- The method should not mutate the input `video` object unless explicitly intended; side effects must be controlled.
- Storage dependency must be non-null and correctly initialized before invocation.
- URIs must be validated or sanitized before transformation; invalid URIs should trigger errors.
- The transformation process should maintain idempotency if called multiple times with the same inputs.
- Null or undefined `video` objects should be handled gracefully, with appropriate error propagation.
- The method must not leak resources or leave dangling references in storage.

## Patterns
- Use consistent naming conventions: `transformVideoUri` clearly indicates transformation intent.
- Error handling should follow the established pattern: catch exceptions, log errors, and propagate as needed.
- Storage interactions should be abstracted via the `Storage` reference, respecting its interface.
- Asynchronous operations must use `await` to ensure proper sequencing.
- Churn-prone: modifications to `transformVideoUri` often involve URI parsing, storage updates, or error handling; ensure backward compatibility.

## Pitfalls
- Frequent modifications to `transformVideoUri` suggest complexity; avoid introducing side effects or race conditions.
- Beware of null/undefined `video` objects; missing validation can cause runtime errors.
- Storage dependency must be correctly injected; incorrect or missing dependencies lead to failures.
- Do not assume URI validity; always validate before transformation.
- Avoid tight coupling with specific storage implementations; rely on the `Storage` interface.
- Churn hotspots indicate potential instability; test extensively after changes.
- Do not modify the `packages/app/server/src/__tests__/setup.ts` unless necessary; it may contain setup logic affecting test stability.

## Dependencies
- **Storage:** Must be correctly instantiated and passed to `transformVideoUri`. Use the interface's methods reliably, respecting their expected behavior.
- External libraries (globally imported) should be used for URI validation or other auxiliary tasks, following established patterns.
- Ensure that any external dependencies used within `transformVideoUri` are compatible with asynchronous operations and error handling conventions.

---

**Note:** Maintain strict adherence to the invariants and patterns to prevent regressions, especially given the high churn and frequent modifications in this code area.