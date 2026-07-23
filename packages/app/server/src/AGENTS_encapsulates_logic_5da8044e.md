# Package: packages/app/server/src

## Purpose
Encapsulates server-side logic for user spend management and error handling, focusing on retrieving balances, updating user spend pools, and managing upstream response errors. It provides core transactional and error-resilient operations critical to financial workflows.

## Boundaries
- **Includes:**  
  - `getBalance()`: Fetches total user balance, likely from a database or cache.  
  - `upsertUserSpendPoolUsage()`: Atomically updates or inserts user spend pool records within a Prisma transaction, ensuring data consistency during concurrent operations.  
  - `handleUpstreamError()`: Processes upstream HTTP responses, throwing or handling errors based on response status or content.

- **Excludes:**  
  - User authentication/authorization logic (should be handled upstream).  
  - External payment gateways or external API integrations beyond response error handling.  
  - Business logic for spend pool creation, deletion, or complex validation (beyond basic upsert).  
  - UI rendering or client-side code.  
  - Non-transactional data retrieval or background jobs.

## Invariants
- `upsertUserSpendPoolUsage()` must be invoked within an active Prisma transaction (`tx`) to ensure atomicity.  
- `getBalance()` must return a non-negative number; if negative, it indicates a data inconsistency.  
- `handleUpstreamError()` must never swallow errors silently; it should throw or escalate after processing.  
- All methods assume proper dependency injection; no internal state is maintained.  
- Null or undefined `userId`, `spendPoolId`, or `amount` parameters are invalid; validation should be enforced externally or at call sites.  
- `amount` must be a `Decimal` object, not a primitive number, to avoid precision errors.  
- Response handling in `handleUpstreamError()` should consider HTTP status codes and response body content to determine error severity.

## Patterns
- Use explicit async/await syntax for all I/O operations.  
- Consistent error handling: `handleUpstreamError()` processes `Response` objects, throwing on error status.  
- Transactional integrity: `upsertUserSpendPoolUsage()` requires a Prisma `TransactionClient` passed explicitly, emphasizing explicit transaction boundaries.  
- Naming conventions:  
  - Methods prefixed with `get` or `fetch` for retrieval.  
  - Methods prefixed with `upsert` for create/update logic.  
  - Error handling methods prefixed with `handle`.  
- Decimal usage for monetary amounts to prevent floating-point inaccuracies.  
- Frequent modifications suggest these methods are core to spend and balance logic, requiring careful change management.

## Pitfalls
- **Churn Hotspots:**  
  - `getBalance()`, `upsertUserSpendPoolUsage()`, `handleUpstreamError()` have high churn; modifications risk introducing regressions or inconsistencies.  
  - Changes to `getBalance()` must consider caching or external data sources; frequent updates may affect performance or correctness.  
  - `upsertUserSpendPoolUsage()` must handle concurrent updates; improper transaction handling can cause race conditions or data corruption.  
  - `handleUpstreamError()` must correctly interpret varied response formats; misinterpretation can lead to unhandled errors or silent failures.

- **Common mistakes:**  
  - Omitting transaction context in `upsertUserSpendPoolUsage()`.  
  - Not validating input parameters before calling these methods.  
  - Ignoring the need for consistent error propagation in `handleUpstreamError()`.  
  - Assuming `getBalance()` is always accurate without considering cache invalidation or external data refresh.

## Dependencies
- **Prisma.TransactionClient:**  
  - Must be a valid Prisma transaction context; ensure caller manages transaction lifecycle.  
  - Do not reuse transaction clients outside their scope.

- **Decimal:**  
  - Use the `Decimal` class for `amount` to maintain precision; avoid primitive number types.

- **Response (globalThis.Response):**  
  - Handle HTTP status codes (e.g., 4xx, 5xx) explicitly; consider response body content for detailed error info.  
  - Do not assume all responses are successful; always check status before processing.

- **External APIs:**  
  - No external dependencies are directly imported; assume all external interactions are via `Response` objects passed to `handleUpstreamError()`.

---

**Note:**  
Agents modifying this code should prioritize maintaining transactional integrity, input validation, and error handling consistency. Frequent churn areas require thorough testing to prevent regressions.