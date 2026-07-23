# GenerateCdpJwt Intent Node

## Purpose
Handles creation of JWT tokens for Coinbase Commerce Data Platform (CDP) API authentication, encapsulating token generation logic with configurable parameters. Ensures tokens are generated with correct claims, expiration, and request context.

## Boundaries
- **Belongs here:** JWT generation logic, including request metadata (method, path, host), expiration, and token signing.
- **Does NOT belong:** Authentication flows unrelated to JWT creation, token validation, or key management; external API request handling; user session management; or storage of tokens.

## Invariants
- The `generateCdpJwt` function must always produce a valid JWT signed with the correct secret/key, using the `generateJwt` dependency.
- `expiresIn` defaults to `1200000000` (approx. 38 years); must be explicitly set or validated to prevent unintended long-lived tokens.
- `requestHost` defaults to `'api.cdp.coinbase.com'`; should be overridden only when targeting different endpoints.
- The input `GenerateCdpJwtInput` must be validated for presence and correctness before invocation.
- JWT claims must include all necessary request context (method, path, host) to ensure proper API authorization.
- No external dependencies other than `generateJwt` should influence token payload or signing process.
- The function must be async, ensuring proper handling of the `generateJwt` promise.

## Patterns
- Use `generateJwt` to sign tokens, passing payload with request metadata and expiration.
- Default parameters should be explicitly set for `requestHost` and `expiresIn`.
- Maintain strict input validation for `GenerateCdpJwtInput` before calling `generateJwt`.
- Follow naming conventions: function named `generateCdpJwt`, input interface `GenerateCdpJwtInput`.
- Handle errors from `generateJwt` gracefully, propagating or logging as per project standards.
- Keep token expiration configurable but within safe bounds; avoid excessively long durations unless explicitly intended.
- Use `toJsonSafe.ts` for serializing payloads if needed, ensuring no data loss or serialization errors.

## Pitfalls
- Frequently modified: `generateCdpJwt`, `GenerateCdpJwtInput`, increasing risk of inconsistent updates.
- Hardcoded default `expiresIn` may lead to security issues if not overridden; document this clearly.
- Forgetting to validate input fields can produce invalid tokens or runtime errors.
- Relying solely on `generateJwt` without verifying its implementation or error handling can cause silent failures.
- Not updating related modules (`facilitatorService.ts`, `constants.ts`) when token logic changes.
- Churn in `generateCdpJwt` suggests evolving requirements; ensure backward compatibility if used elsewhere.
- Overlooking request context (method, path, host) can produce invalid or insecure tokens.

## Dependencies
- **generateJwt:** Core dependency for signing JWTs; must be used with correct payload structure.
- **toJsonSafe.ts:** Utility for safe serialization of payload data; ensure payloads are serialized consistently.
- **Constants.ts:** May contain constants related to token durations or secret keys; verify usage aligns with current security policies.
- **External API endpoints:** `api.cdp.coinbase.com` as default; confirm endpoint correctness for environment (prod/staging).
- **Security considerations:** Ensure secret keys used in `generateJwt` are securely stored and accessed; avoid hardcoding secrets.

---

**Note:** Always verify the latest security standards for JWT handling, including key rotation, claim validation, and expiration management, especially given the high churn rate indicating evolving security requirements.