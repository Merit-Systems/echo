# [Semantic Cluster: Resource Handling & Cost Calculation in Server Router]

## Purpose
This cluster manages resource-related HTTP routes (`tavilyExtractRoute`, `tavilySearchRoute`, `e2bExecuteRoute`, `tavilyCrawlRoute`) and associated cost calculations, providing a structured API for resource extraction, search, execution, and crawling within the server. It encapsulates request handling, error management, and cost estimations critical for resource operations.

## Boundaries
- **Belongs here:** Route handlers (`tavilyExtractRoute`, `tavilySearchRoute`, `e2bExecuteRoute`, `tavilyCrawlRoute`), cost calculation functions, `handleResourceRequestWithErrorHandling`, `getEchoAppId`, and `ResourceHandlerConfig`.
- **Does NOT belong here:** Database schema definitions, core business logic unrelated to resource routes, UI components, or client-side code. Any non-resource-specific middleware or authentication logic should be outside this cluster.

## Invariants
- `handleResourceRequestWithErrorHandling` must always wrap route handlers, ensuring consistent error handling and request validation.
- `getEchoAppId()` may return `null`; callers must handle null safely.
- Cost calculation functions (`calculateTavilySearchCost`, `calculateE2BExecuteCost`, etc.) must receive valid input objects or `undefined`, returning a `Decimal` that accurately reflects the cost; no negative or nonsensical values.
- Route functions (`tavilyExtractRoute`, etc.) should always invoke `handleResourceRequestWithErrorHandling` internally or follow its pattern to maintain uniform error management.
- `constructor` must initialize with a valid `PrismaClient`; no null or undefined allowed.
- External dependencies (`Decimal`, `Router`, `parameter`) are assumed to be correctly imported and used per their documentation.

## Patterns
- Use `handleResourceRequestWithErrorHandling` as the wrapper for all route handlers to standardize error catching.
- Route functions should extract parameters explicitly, validate inputs, and pass them to cost functions or core logic.
- Cost functions should handle `undefined` inputs gracefully, returning a meaningful `Decimal`.
- Naming conventions: route handlers prefixed with `tavily` or `e2b`, cost functions with `calculate` prefix.
- Use `getEchoAppId()` to retrieve app context; handle `null` cases explicitly.
- Consistently use `Decimal` for monetary or cost calculations to avoid floating-point inaccuracies.
- Maintain statelessness in route handlers; rely on request parameters and external dependencies only.

## Pitfalls
- Failing to handle `null` from `getEchoAppId()` can cause runtime errors downstream.
- Modifying frequently changed functions (`getEchoAppId`, constructor, route handlers) without updating dependent logic risks breaking invariants.
- Not wrapping route handlers with `handleResourceRequestWithErrorHandling` leads to inconsistent error responses.
- Cost functions accepting `undefined` but not handling it internally may produce incorrect costs; always validate inputs.
- Overlooking the `Decimal` type's constraints (precision, scale) may cause subtle bugs in cost calculations.
- Ignoring the high churn in core functions increases risk of regressions; changes should be tested thoroughly.
- External dependencies (`parameter`, `e2bExecutePythonSnippet`) require correct configuration; misusing them can cause runtime failures.

## Dependencies
- **External:** `Decimal` (for precise cost calculations), `Router` (for route definitions), `parameter` (for parameter parsing), `e2bExecutePythonSnippet` (for executing Python snippets in `e2bExecuteRoute`).
- **Internal:** `handleResourceRequestWithErrorHandling` (wraps route handlers), `HttpError` (for error responses), `ResourceHandlerConfig` (configures request handling), `getEchoAppId` (context retrieval), `constructor` (initializes database connection).
- **Usage notes:** Always ensure `Decimal` is used for all cost-related functions to maintain precision. Use `parameter` to parse and validate request parameters before processing.

---

This node captures the deep, non-obvious knowledge necessary for AI agents to understand the resource handling and cost calculation logic, ensuring robust, consistent modifications and integrations.