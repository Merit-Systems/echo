# Semantic Cluster: Server Resources and Transaction Creation

## Purpose
This cluster manages HTTP route handlers for search and crawl functionalities under `resources/tavily`, and provides a core function `createE2BTransaction` for constructing transaction objects used in E2B (End-to-End Business) workflows. It encapsulates request routing, transaction instantiation, and proxy passthrough services, enabling coordinated data flow and external communication within the server.

## Boundaries
- **Belongs here:**
  - Route handlers for `/search` and `/crawl` endpoints, including request validation, parameter parsing, and response formatting.
  - `createE2BTransaction`, which synthesizes transaction objects from input/output data and cost metrics, ensuring consistent transaction structure.
  - `ProxyPassthroughService`, which facilitates proxying requests or data passthrough, assuming it handles external API interactions or middleware logic.
- **Does NOT belong here:**
  - Business logic unrelated to request routing or transaction creation (e.g., core crawling algorithms, search indexing).
  - Data persistence layers or database access code.
  - Authentication, authorization, or user session management (unless integrated directly into route handlers).
  - External API client implementations—these should be abstracted or injected.

## Invariants
- `createE2BTransaction` must always produce a valid `Transaction` object with non-null `input`, `output`, and `cost`.
- The `cost` parameter passed to `createE2BTransaction` must be a `Decimal` type, and its value should be validated before invocation.
- Route handlers should validate request parameters strictly; invalid requests must return proper HTTP error responses.
- `ProxyPassthroughService` should not perform side effects outside its scope; it must handle errors gracefully, returning appropriate error responses.
- The `Transaction` reference used in the cluster must be consistent; modifications to its structure or lifecycle are restricted to ensure data integrity across components.
- Frequently modified files (`route.ts`, `createE2BTransaction`) imply high churn; changes should be reviewed for side effects on request flow and transaction consistency.

## Patterns
- Route handlers should follow a pattern of:
  - Extracting parameters from request objects.
  - Validating parameters explicitly.
  - Calling core functions (`createE2BTransaction`) with sanitized data.
  - Returning responses with proper status codes.
- `createE2BTransaction` should:
  - Enforce that `input` and `output` are non-null.
  - Use consistent naming conventions for parameters and returned object fields.
  - Handle edge cases where input data may be incomplete or malformed.
- Error handling:
  - Use try-catch blocks around external or risky operations.
  - Log errors with context-specific messages.
  - Return standardized error responses.
- Naming conventions:
  - Use descriptive, context-specific names for route parameters, request bodies, and transaction fields.
  - Maintain consistent casing and formatting across modules.

## Pitfalls
- **Churn-related risks:**
  - Frequent modifications to route files and `createE2BTransaction` increase risk of breaking request flow or transaction integrity.
  - Changes in transaction structure may cause downstream issues if not propagated properly.
- **Coupling hazards:**
  - Tight coupling between route handlers and `Transaction` references can lead to brittle code if `Transaction` shape evolves.
  - `ProxyPassthroughService` may introduce external dependencies; improper use can cause latency or error propagation.
- **Null-safety and validation:**
  - Failing to validate request parameters can lead to null dereferences or invalid transactions.
  - Assumptions about `cost` being a `Decimal` must be enforced; improper input types can cause runtime errors.
- **Error handling:**
  - Not catching errors in `createE2BTransaction` or route handlers may result in unhandled promise rejections or server crashes.
- **High churn files:**
  - Frequent updates to route files suggest evolving API contracts; agents must verify compatibility and test thoroughly after modifications.

## Dependencies
- **Transaction:**  
  - Core data structure; must be used consistently when creating or manipulating transactions.
  - Ensure any updates to `Transaction` shape are reflected in `createE2BTransaction` and route handlers.
- **External libraries (implied):**  
  - Decimal library for `cost` parameter; validate and handle conversions explicitly.
  - HTTP framework (e.g., Express) for route definitions; follow framework conventions for middleware and error handling.
- **`ProxyPassthroughService`:**  
  - Use as an abstraction for external API calls or data forwarding.
  - Handle errors internally; do not assume external services are always available.
- **Request validation libraries (if used):**  
  - Enforce strict parameter validation to prevent invalid data from propagating.
- **Logging and error reporting:**  
  - Implement consistent logging for traceability, especially around high-churn files.

---

**Note:** Given the high modification frequency of key files, agents should implement rigorous testing and validation procedures after each change to maintain stability and correctness.