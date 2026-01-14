# Referral Reward Validation and Error Handling

## Purpose
This area manages validation of referral reward data, parsing error responses from server interactions, and retrieving the base URL for API endpoints. It encapsulates core logic for ensuring referral reward integrity and consistent error processing.

## Boundaries
- **Belongs here:** Validation logic for `ReferralRewardData`, error response parsing, and URL retrieval.
- **Does NOT belong here:** Business logic unrelated to referral rewards, UI rendering, or network request initiation. Data models (e.g., `ReferralRewardData`) should reside elsewhere; this code assumes their correctness.

## Invariants
- `validateReferralReward` must always return a `ValidationResult` indicating success or failure; it cannot produce a null or undefined result.
- `parseErrorResponse` must handle all error body formats gracefully; it should not throw exceptions on malformed input.
- `getBaseUrl` must consistently return a non-empty string representing the API base URL; it should not return null or undefined.
- `validateReferralReward` should not mutate input data.
- Error parsing should respect the status code; certain errors may require different handling based on status.
- The `ValidationResult` must adhere to a contract: success indicated by a specific flag, errors by messages; this invariant must be preserved.

## Patterns
- Use explicit null/undefined checks in `parseErrorResponse` to avoid runtime exceptions.
- Maintain consistent naming conventions: methods prefixed with verbs (`validate`, `parse`, `get`).
- Error responses should be parsed into a structured object, not raw strings.
- `validateReferralReward` should leverage existing validation utilities or rules; avoid duplicated logic.
- `getBaseUrl` should cache the result if it involves expensive computation or network calls.
- When modifying, preserve the method signatures and ensure backward compatibility with existing validation/error handling flows.

## Pitfalls
- Frequent modifications to `validateReferralReward`, `parseErrorResponse`, and `getBaseUrl` increase risk of regressions; ensure thorough testing.
- Failing to handle malformed error bodies in `parseErrorResponse` can cause unhandled exceptions.
- Returning null or undefined from `getBaseUrl` violates invariants; always return a valid URL string.
- Overlooking the dependency on `ValidationResult` can lead to inconsistent validation outcomes.
- Churn in validation logic suggests evolving rules; document changes meticulously.
- Avoid side effects in validation and parsing methods; they should be pure functions.
- Be cautious of null-safety: `currentReferralReward` may contain null fields; validation should handle this gracefully.

## Dependencies
- **ValidationResult:** Must be used consistently to communicate validation outcomes; ensure all validation methods produce a valid `ValidationResult`.
- **Decimal:** Used for precise numeric operations; avoid floating-point inaccuracies.
- External validation utilities or schemas should be used within `validateReferralReward` for consistency.
- Error response parsing should adhere to the expected server error formats; adapt parsing logic if server response schemas evolve.
- `ReferralRewardData` should be validated before passing into `validateReferralReward`, but this method should also perform internal validation as needed.

---

*Note:* When modifying any method, verify that invariants hold, especially regarding return values and error handling. Maintain clear separation of concerns: validation, parsing, configuration retrieval.