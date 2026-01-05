# Tavily Resource Calculation

## Purpose
This area encapsulates the logic for calculating the actual cost of Tavily data extraction, specifically via the `calculateTavilyExtractActualCost` function. It manages cost computations based on input parameters and outputs precise decimal values, integral to billing or resource tracking.

## Boundaries
- **Belongs here:** Cost calculation logic, input/output data structures (`TavilyExtractInput`, `TavilyExtractOutput`), and the `calculateTavilyExtractActualCost` function.
- **Does NOT belong here:** External data fetching, network requests, or database interactions; these should be handled outside this module. Utility functions unrelated to cost calculation, or UI rendering, are outside scope.

## Invariants
- The function must always return a `Decimal` representing the cost; no nulls or undefined.
- Inputs must conform to `TavilyExtractInput` schema; invalid inputs should be validated before invocation.
- The output should reflect the latest calculation logic; avoid caching unless explicitly required.
- Cost calculations should respect the precision constraints of `Decimal`; avoid floating-point inaccuracies.
- The module `packages/app/server/src/resources/tavily/search/tavily.ts` may contain supporting search or lookup functions, but core calculation logic must be isolated.
- No side effects; the function should be pure, with no external state modifications.
- The function's behavior must be deterministic given identical inputs.

## Patterns
- Use `Decimal` for all monetary or precise calculations; avoid JavaScript number types for currency.
- Follow naming conventions: `calculateTavilyExtractActualCost` clearly indicates a computation.
- Handle edge cases explicitly, e.g., zero or negative input values, with validation or safeguards.
- Document assumptions about input fields within `TavilyExtractInput`.
- Maintain idempotency; repeated calls with same inputs produce same outputs.
- Use explicit error handling for invalid inputs, but avoid throwing exceptions unless critical.
- Keep the calculation logic isolated; avoid embedding side effects or external calls within the function.

## Pitfalls
- Frequent modifications (5 versions) suggest high churn; ensure changes are well-tested.
- Be cautious of floating-point errors; always use `Decimal` for calculations.
- Watch for null or undefined inputs; validate early.
- Avoid tight coupling with unrelated modules; dependencies should be explicit and minimal.
- Do not assume input data is sanitized; validate inputs before calculation.
- Beware of race conditions if the function is invoked concurrently; ensure thread safety if applicable.
- Do not cache results internally unless explicitly designed; stale data can cause incorrect billing.
- When modifying, ensure to update related tests to reflect new logic or invariants.

## Dependencies
- **External:** `Decimal` library must be used for all calculations to ensure precision.
- **Internal:** The module `packages/app/server/src/resources/tavily/search/tavily.ts` may provide auxiliary search or lookup functions; use them cautiously, ensuring they do not introduce side effects or violate invariants.
- Validate that `TavilyExtractInput` and `TavilyExtractOutput` schemas are adhered to before invoking the calculation function to prevent runtime errors.

---

**Note:** Given the high churn, maintain clear version control and thorough testing when modifying `calculateTavilyExtractActualCost` or related entities. Ensure that any change preserves the deterministic and precise nature of cost calculations.