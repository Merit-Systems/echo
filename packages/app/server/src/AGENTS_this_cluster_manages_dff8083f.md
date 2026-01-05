# Cleanup and API Key Management

## Purpose
This cluster manages the cleanup routines for server-side resources and updates metadata related to API key usage, ensuring resource hygiene and accurate tracking of API key activity within the application.

## Boundaries
- **Belongs here:**  
  - Implementation of scheduled cleanup processes (`startCleanupProcess`)  
  - Updating last-used timestamps for API keys (`updateApiKeyLastUsed`)  
  - Transactional database operations involving API key metadata  
- **Does NOT belong here:**  
  - User authentication or authorization logic  
  - External API integrations outside of internal database updates  
  - Non-cleanup related background jobs or scheduled tasks unrelated to resource cleanup or API key tracking

## Invariants
- `startCleanupProcess` must be idempotent; repeated invocations should not cause inconsistent state or errors.  
- `updateApiKeyLastUsed` must be called within an active Prisma transaction (`tx`) to ensure atomicity; do not call outside a transaction context.  
- API key last-used timestamps must never be set to null or invalid dates; enforce non-null, valid Date objects.  
- Cleanup process should not delete or modify resources that are actively in use or marked as protected; implement safeguards or flags to prevent accidental deletion.  
- All database updates via Prisma transactions should handle errors gracefully, rolling back on failure to maintain consistency.

## Patterns
- Use explicit transaction management: always pass a `Prisma.TransactionClient` (`tx`) to `updateApiKeyLastUsed`.  
- Follow naming conventions: methods prefixed with `start` for initiating processes, `update` for state changes.  
- Handle errors explicitly within `startCleanupProcess`, ensuring cleanup failures do not leave the system in inconsistent states.  
- Use consistent timestamp formats and ensure timezone-awareness if applicable.  
- Document assumptions about resource states before cleanup or update operations.

## Pitfalls
- **Churn:** Both methods are frequently modified; avoid introducing complex logic without thorough testing.  
- **Concurrency:** `updateApiKeyLastUsed` relies on transactional safety; avoid calling it outside a transaction or in parallel without proper locking.  
- **Resource leaks:** `startCleanupProcess` may inadvertently leave resources uncleaned if error handling is incomplete.  
- **Null safety:** Ensure `apiKeyId` is validated before use; null or malformed IDs can cause silent failures or data corruption.  
- **Side effects:** Be cautious of side effects within cleanup routines; unintended deletions or updates can cause data loss.

## Dependencies
- **Prisma ORM:**  
  - Use the provided `tx` transaction client for all database operations to ensure atomicity.  
  - Validate transaction state before performing updates.  
- **Database schema assumptions:**  
  - `apiKeyId` corresponds to a valid API key record.  
  - Timestamps are stored in a consistent, timezone-aware format.  
- **Error handling:**  
  - Implement try-catch blocks within `startCleanupProcess` to handle and log failures without crashing the process.  
  - Ensure `updateApiKeyLastUsed` is called only within a successful transaction context.  
- **No external dependencies** are directly involved; rely solely on Prisma and internal database schema.