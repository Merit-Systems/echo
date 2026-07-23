# Semantic Cluster: Provider and Service Management (packages/app/server/src)

## Purpose
This cluster manages provider types, executes model requests, verifies video access, and orchestrates echo and earnings services. It encapsulates core business logic for provider handling, user usage validation, and service configuration.

## Boundaries
- **Belongs here:** Provider type retrieval (`getType()`), model request execution (`executeModelRequest`), video access verification (`verifyVideoAccess`), echo control configuration (`setEchoControlService`), and user usage checks (`checkExistingUserUsage`, `checkValidFreeTierSpendPool`, `getOrNoneFreeTierSpendPool`).
- **Does NOT belong here:** Authentication logic (handled in `auth/index.ts`), external API integrations (e.g., GeminiVeoProvider, checkBalance), database schema definitions (handled by Prisma models), or HTTP layer concerns (e.g., request/response handling outside `executeModelRequest`).

## Invariants
- `getType()` must consistently return the correct `ProviderType` for the provider instance; mismatches can cause downstream errors.
- `executeModelRequest()` must always handle `req`, `res`, and `processedHeaders` atomically; partial failures should trigger proper error handling via `HttpError`.
- `verifyVideoAccess()` should throw if access is invalid; never silently fail or grant access.
- `setEchoControlService()` must only assign a valid `EchoControlService` instance; null or undefined assignments should be guarded against.
- Constructors must initialize all dependencies (`db`, `model`, optional `echoControlService`) before use; no uninitialized state.
- Usage validation functions (`checkExistingUserUsage`, `checkValidFreeTierSpendPool`) must enforce limits strictly; no bypasses.
- `getOrNoneFreeTierSpendPool()` should return `null` if no free tier pool exists, not throw.
- External dependencies like `HttpError` and `transaction` must be used within their intended contexts; misuse can cause resource leaks or inconsistent states.

## Patterns
- Use explicit dependency injection via constructors for services (`EchoControlService`, `PrismaClient`).
- Consistently handle asynchronous operations with `async/await`.
- Error handling should leverage `HttpError` for HTTP-related failures.
- Naming conventions: methods prefixed with `get` for retrieval, `check` for validation, `set` for configuration.
- When modifying `getType()`, ensure all implementations return a `ProviderType` enum value; avoid returning undefined or inconsistent types.
- For `executeModelRequest`, follow the pattern of passing `processedHeaders` explicitly, ensuring header integrity.
- Use `Promise`-based return types for all async methods that may fail or involve I/O.
- Maintain separation of concerns: core logic in service classes, external calls in dedicated modules.

## Pitfalls
- **High churn methods (`getType()`, `executeModelRequest`, `verifyVideoAccess`, `setEchoControlService`)**: frequent modifications risk introducing inconsistencies or breaking invariants.
- **EchoControlService dependency**: dependency on 7 external entities increases coupling; modifications can ripple unexpectedly.
- **Null-safety**: constructors with optional `echoControlService` require null checks before usage.
- **Concurrency issues**: `executeModelRequest` may involve streaming; ensure proper handling of stream lifecycle and errors.
- **Usage validation**: `checkExistingUserUsage` and `checkValidFreeTierSpendPool` must be strict; lax validation leads to resource abuse.
- **Frequent code changes**: methods like `getType()` are highly volatile; avoid assumptions based on previous versions.
- **Resource management**: `transaction` usage must be properly committed or rolled back; improper handling leads to data inconsistency.
- **External dependency reliance**: `HttpError`, `transaction`, and `verifyUserHeaderCheck` are critical; misuse can cause security or stability issues.

## Dependencies
- **References:** `X402AuthenticationResult`, `ApiKeyValidationResult`, `Transaction` — ensure correct data flow and validation.
- **Calls:** `HttpError` for error handling; use consistently for HTTP failures.
- **External modules:** `Decimal` for precise calculations, `existsSync`, `join` for filesystem checks, `transaction` for DB atomicity, `verifyUserHeaderCheck` for header validation.
- **Usage notes:** Always validate headers with `verifyUserHeaderCheck` before processing requests; use `transaction` for any database modifications involving multiple steps to ensure atomicity.
- **Dependent entities:** `BaseProvider`, `GeminiVeoProvider`, `EscrowRequest`, `X402AuthenticationService`, `checkBalance` — understand their interfaces and side effects for correct integration.

---

**Note:** Agents should monitor high-churn methods closely, enforce strict validation, and be cautious with dependency updates to prevent regressions.