# Semantic Cluster: Error Handling & Markup Validation (packages/app/server/src)

## Purpose
This cluster manages upstream error handling via `handleUpstreamError` and validates markup data with `validateMarkup`. It ensures robust error propagation and data integrity within server request flows.

## Boundaries
- **Belongs here:** Error handling for upstream responses (`handleUpstreamError`), markup data validation (`validateMarkup`).
- **Does NOT belong:** Core network request logic, response serialization, or UI rendering; these are outside this cluster’s scope. ValidationResult and Decimal are dependencies but not part of core business logic.

## Invariants
- `handleUpstreamError` must **never** swallow errors silently; it should propagate or transform errors appropriately.
- `response` parameter in `handleUpstreamError` must be a valid `globalThis.Response` object; null or undefined responses are invalid.
- `validateMarkup` must **not** mutate `markUp`; it should only read and validate.
- `ValidationResult` must accurately reflect the validity state; invalid results should include specific error details.
- All error handling should preserve original error context for debugging.
- `validateMarkup` must handle all expected data fields, returning a comprehensive `ValidationResult`.

## Patterns
- Use consistent naming: `handleUpstreamError`, `validateMarkup`.
- Error handling pattern: catch, log, transform, or rethrow errors; avoid silent failures.
- Validation pattern: return detailed `ValidationResult` objects; avoid throwing exceptions for validation failures.
- Churn-sensitive: frequently modified; ensure backward compatibility when updating logic.
- Asynchronous handling: `handleUpstreamError` is async; always await promises.
- Use `Decimal` for numeric precision where applicable, especially in validation or calculations.

## Pitfalls
- **Silent failures:** Failing to propagate errors in `handleUpstreamError` can cause downstream issues.
- **Null/undefined assumptions:** Not validating `response` or `markUp` inputs can lead to runtime errors.
- **Churn risk:** Frequent modifications increase risk of introducing bugs; document assumptions thoroughly.
- **Validation gaps:** Incomplete validation logic in `validateMarkup` may allow invalid data.
- **Error context loss:** Not preserving original error info in `handleUpstreamError` hampers debugging.
- **Dependency misuse:** Incorrect usage of `Decimal` or `ValidationResult` can cause subtle bugs.

## Dependencies
- **ValidationResult:** Must be used to convey validation status; ensure it’s correctly constructed and interpreted.
- **Decimal:** Use for precise numeric operations; avoid floating-point errors in validation or calculations.
- **External imports:** Be cautious of version mismatches; ensure `Decimal` is correctly imported and used consistently.

---

**Note:** Given the high churn rate, agents should pay special attention to recent changes in `handleUpstreamError` and `validateMarkup`, verifying that error handling and validation logic remain robust and backward compatible.