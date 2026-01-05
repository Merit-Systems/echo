# Package: packages/app/server/src

## Purpose
Provides core server-side utilities for user identification, environment configuration, storage initialization, URL construction, and updating user financial data within the application. Acts as a foundational layer supporting user-specific operations and external integrations.

## Boundaries
- **Includes:**  
  - User ID retrieval (`getRequiredUserId`)  
  - Base URL generation (`getBaseUrl`)  
  - Storage setup (`initializeStorage`)  
  - Environment variable access (`getRequiredEnvVar`)  
  - User spending updates (`updateUserTotalSpent`)  
  - OpenAI provider module (`OpenAIBaseProvider.ts`)
- **Excludes:**  
  - Business logic beyond utility functions  
  - API route handlers, middleware, or request/response processing  
  - UI components or client-side code  
  - External API integrations beyond OpenAI provider module  
  - Data validation or serialization logic (handled elsewhere)

## Invariants
- `getRequiredUserId()` must always return a non-empty string; it assumes prior authentication context is valid.  
- `getBaseUrl(reqPath?)` must construct URLs consistently, respecting environment-specific base URLs; must handle optional `reqPath` gracefully.  
- `initializeStorage()` must return a valid `Storage` instance or `null`; must not throw exceptions unexpectedly.  
- `getRequiredEnvVar(name)` must throw if environment variable `name` is missing; guarantees environment-dependent configuration is present.  
- `updateUserTotalSpent()` must be called within a Prisma transaction (`tx`) and must not violate transaction boundaries; `userId` must be valid, `amount` must be a Decimal, and updates should be atomic.

## Patterns
- Use `getRequiredEnvVar()` for all environment-dependent configs; avoid hardcoded values.  
- Always invoke `initializeStorage()` during startup; check for `null` before proceeding.  
- When generating URLs via `getBaseUrl()`, pass specific request paths; ensure URL concatenation is correct and environment-aware.  
- `getRequiredUserId()` should be called only after authentication; do not assume user context is present otherwise.  
- Wrap `updateUserTotalSpent()` within a Prisma transaction; handle errors explicitly, avoid partial updates.  
- Follow naming conventions: methods prefixed with `get` for retrieval, `initialize` for setup, `update` for mutations.

## Pitfalls
- Frequent modifications to `getRequiredUserId()`, `getBaseUrl()`, `initializeStorage()`, `getRequiredEnvVar()`, and `updateUserTotalSpent()` indicate potential instability; agents must verify correctness after changes.  
- Do not assume environment variables are always set; rely on `getRequiredEnvVar()` to enforce presence.  
- `initializeStorage()` returning `null` requires null-checks; failing to do so may cause runtime errors.  
- `updateUserTotalSpent()` must be called within a transaction; neglecting this risks data inconsistency.  
- Be cautious with URL concatenation in `getBaseUrl()`, especially with trailing slashes or missing segments.  
- Since these methods are frequently modified, avoid caching results unless explicitly invalidated, to prevent stale data.

## Dependencies
- **Storage:**  
  - Used for persistent data management; must be initialized before use.  
  - Call `initializeStorage()` during startup; handle `null` case gracefully.  
- **OpenAIBaseProvider.ts:**  
  - Provides base provider functionality for OpenAI API interactions; ensure correct import paths and configurations.  
- **Environment Variables:**  
  - Critical for configuration; access via `getRequiredEnvVar()` to guarantee presence.  
- **Prisma TransactionClient (`tx`):**  
  - Must be used for `updateUserTotalSpent()` to ensure atomicity; avoid external transaction management.  

---

**Note:** Always verify the latest version of methods after modifications, especially those marked as high-churn, to prevent regressions or inconsistencies.