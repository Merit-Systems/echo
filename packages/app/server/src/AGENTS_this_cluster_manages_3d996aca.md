# Semantic Cluster: Transaction and Pricing Handling (packages/app/server/src)

## Purpose
This cluster manages transaction processing, request formatting, and cost calculations related to tools and escrow, serving as the core logic for transaction cost estimation, request parsing, and response streaming within the server.

## Boundaries
- **Belongs here:**  
  - Methods for extracting user identity (`getUserId`)  
  - Request body formatting (`formatRequestBody`)  
  - Handling raw transaction data (`handleBody`)  
  - Parsing SSE responses (`parseSSEResponsesFormat`)  
  - Cost application logic (`applyEchoMarkup`)  
  - Cost computation (`computeTransactionCosts`, `predictMaxToolCost`)  
- **Does NOT belong here:**  
  - UI rendering or client-side request initiation  
  - Authentication middleware or user session management  
  - External API integrations unrelated to pricing or transaction processing  
  - Data persistence beyond transient computations (e.g., database storage)  

## Invariants
- `getUserId()` must return `null` if no user is authenticated; never throw exceptions.  
- `formatRequestBody()` must include all necessary headers and correctly serialize the request; headers are immutable post-call.  
- `handleBody()` must parse `data` into a valid `Transaction` object; invalid data should trigger specific error handling, not silent failures.  
- `parseSSEResponsesFormat()` must produce a complete, ordered list of `ResponseStreamEvent` objects; responses are assumed to be well-formed, but malformed data must be gracefully handled.  
- `applyEchoMarkup()` should only modify the `cost` when `cost` is a valid `Decimal`; avoid side effects.  
- `computeTransactionCosts()` must correctly incorporate `referralCodeId` and `addEchoProfit`; cost calculations depend on `getCostPerToken` and `LlmTransactionMetadata`.  
- `predictMaxToolCost()` relies on `req` and `provider` being valid; must not produce negative costs or throw unhandled errors.  
- All cost functions should respect the `Decimal` precision and avoid floating-point inaccuracies.  

## Patterns
- Use consistent naming conventions: `getUserId`, `formatRequestBody`, `handleBody`, etc.  
- Error handling: propagate errors explicitly; do not swallow exceptions silently.  
- When modifying `cost`, use `applyEchoMarkup()` to ensure markup logic is centralized.  
- Asynchronous functions (`async`) should always await dependencies and handle potential rejections.  
- Cost calculation functions (`calculateToolCost`, `predictMaxToolCost`) should cache results if called repeatedly with identical inputs.  
- Use dependency injection for `BaseProvider` and `Request` objects to facilitate testing and mocking.  
- Maintain null-safety: `getUserId()` may return `null`; downstream code must handle this case explicitly.  
- When parsing responses (`parseSSEResponsesFormat`), validate data structure before processing to prevent runtime errors.  

## Pitfalls
- Frequent modifications to `getUserId`, `formatRequestBody`, `handleBody`, `parseSSEResponsesFormat`, and `applyEchoMarkup` indicate high churn; changes here risk breaking assumptions about request/response formats.  
- Null handling in `getUserId()` is critical; incorrect assumptions can lead to unauthorized actions or null dereferences.  
- Cost calculation functions depend on external `getCostPerToken`; incorrect or stale values may cause mispricing.  
- `computeTransactionCosts()` involves multiple parameters; improper use of `referralCodeId` or `addEchoProfit` can produce inconsistent costs.  
- `predictMaxToolCost()` relies on `provider` and `req`; misconfiguration or invalid inputs can yield negative or nonsensical costs.  
- SSE response parsing (`parseSSEResponsesFormat`) is sensitive to data format; malformed data can cause unhandled exceptions if not validated.  
- High churn in core methods suggests frequent API or data format changes; agents should monitor version history and deprecate old patterns carefully.  

## Dependencies
- **References:**  
  - `LlmTransactionMetadata`, `Transaction`, `Tool`, `EscrowRequest`, `BaseProvider` — ensure these types are correctly instantiated and validated before use.  
- **Calls:**  
  - `getCostPerToken` — use with awareness of current pricing models; cache results if possible.  
  - `UnauthorizedError` — handle explicitly to prevent silent failures during auth failures.  
- **External Imports:**  
  - `Decimal` — use for all monetary calculations; avoid floating-point inaccuracies.  
  - `high` — (assumed to be a utility or constant); verify its purpose and usage context.  

---

**Note:**  
Agents should treat this cluster as a critical, high-churn core responsible for transaction integrity and cost accuracy. Changes require careful validation, especially around null safety, data parsing, and cost calculations. Proper dependency management and error handling are essential to prevent subtle bugs.