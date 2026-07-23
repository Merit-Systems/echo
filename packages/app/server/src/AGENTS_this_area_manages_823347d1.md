# API Key Validation and Hashing

## Purpose
This area manages API key validation and hashing mechanisms, enabling secure authentication by verifying API keys and generating hashes for storage or comparison. It encapsulates core logic for API key integrity and security.

## Boundaries
- **Belongs here:** `validateApiKey` method, `hashApiKey` function, and related cryptographic operations within `BaseProvider.ts`.
- **Does NOT belong here:** User management, token issuance, or broader authentication flows outside API key validation. External token verification (e.g., JWT) is outside this scope unless integrated here.

## Invariants
- `validateApiKey` must return `null` if the API key is invalid or malformed; never throw exceptions for invalid input.
- `hashApiKey` must produce consistent, deterministic hashes for identical input keys.
- Hashing must use `createHmac` with a secret key, ensuring cryptographic security.
- `validateApiKey` should rely on the hashed value comparison, not plaintext matching.
- Null safety: `apiKey` parameter in `validateApiKey` can be empty or null; handle gracefully.
- No side effects: `validateApiKey` should be idempotent and stateless.
- The `ApiKeyValidationResult` must accurately reflect validation status (valid, invalid, or null).

## Patterns
- Use `createHmac` with a consistent secret key for hashing (`hashApiKey`).
- Always sanitize and validate `apiKey` input before processing.
- `validateApiKey` should perform secure comparison (constant-time if applicable) between stored hash and computed hash.
- Error handling: do not throw exceptions for validation failures; return `null` or result objects.
- Maintain naming conventions: `validateApiKey`, `hashApiKey`, and `ApiKeyValidationResult`.
- Modularize cryptographic logic to facilitate testing and potential replacement.

## Pitfalls
- Churn: `validateApiKey` and `hashApiKey` are frequently modified; ensure backward compatibility when updating.
- Hashing errors: using inconsistent secrets or algorithms can invalidate validation.
- Null or empty `apiKey` inputs can cause false positives/negatives if not handled properly.
- Over-reliance on plaintext comparison; always compare hashes securely.
- External dependencies (`createHmac`, `jwtVerify`) must be correctly imported and used; misconfiguration can compromise security.
- Avoid exposing raw API keys or hashes in logs or error messages.
- Be cautious of timing attacks; use secure comparison methods if available.

## Dependencies
- **createHmac**: cryptographic function from Node.js `crypto` module; use with a consistent secret key.
- **jwtVerify**: external JWT verification utility; ensure correct usage and key management if integrated.
- Properly manage secret keys used in `createHmac` to prevent leaks or mismatches.
- Do not hardcode secrets; fetch from secure environment variables or configuration.
- Validate dependency versions regularly to avoid vulnerabilities, especially for cryptographic functions.

---

**Note:** Keep in mind that frequent modifications to `validateApiKey` and `hashApiKey` suggest evolving security requirements; ensure thorough testing and backward compatibility.