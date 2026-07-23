# Tavily Search Cost Calculation

## Purpose
This area manages the computation of the actual cost for Tavily crawling operations, encapsulated in the `calculateTavilyCrawlActualCost` function and related types. It provides the logic to derive a `Decimal` value representing the resource expenditure or effort associated with a specific crawl input.

## Boundaries
- **Belongs here:** Implementation of `calculateTavilyCrawlActualCost`, including input validation, cost computation logic, and output formatting.
- **Does NOT belong here:** UI presentation, API routing, or higher-level orchestration; these should invoke this function but not contain its logic.
- **Types and interfaces** (`TavilyCrawlInput`, `TavilyCrawlOutput`) are defined in `types.ts` and should be considered part of the contract for this calculation.
- **External dependencies** like `Decimal` are used strictly for precise arithmetic; avoid converting to/from native number types within this module.

## Invariants
- The function must **never** return a negative cost.
- Inputs must be validated to prevent null/undefined values; invalid inputs should throw or handle errors explicitly.
- The `Decimal` output must be normalized (e.g., fixed scale) before returning.
- The calculation should **not** mutate input objects.
- The cost calculation logic must respect the defined semantics of `TavilyCrawlInput` and `TavilyCrawlOutput`.

## Patterns
- Use consistent naming: `calculateTavilyCrawlActualCost`, `input`, `output`.
- Perform early validation of `input` fields; throw descriptive errors if invalid.
- Use `Decimal` arithmetic methods (`add`, `mul`, `div`) for all calculations.
- Avoid implicit type coercion; ensure all numeric values are `Decimal` or converted explicitly.
- Document assumptions about input fields influencing cost.
- Maintain idempotency: repeated calls with the same input produce the same output.
- Follow existing code style: indentation, error handling, and comments.

## Pitfalls
- **Churn hotspots**: `types.ts` and `calculateTavilyCrawlActualCost` are frequently modified; ensure backward compatibility.
- **Incorrect assumptions** about input fields' presence or default values can lead to incorrect cost calculations.
- **Neglecting validation** can cause runtime errors or invalid cost outputs.
- **Misuse of `Decimal`**: converting to native number types or losing precision can introduce subtle bugs.
- **Ignoring null-safety**: missing null checks on input fields may cause exceptions.
- **Overcomplicating logic**: keep calculations straightforward; complex branching increases error risk.
- Changes in dependencies (e.g., `Decimal`) may require updates to calculation logic.

## Dependencies
- **Decimal** library: Use its methods (`add`, `sub`, `mul`, `div`, `toFixed`) for all arithmetic to ensure precision.
- **Types (`TavilyCrawlInput`, `TavilyCrawlOutput`)**: Understand their structure, optional fields, and default values.
- **Error handling conventions**: Follow existing patterns for validation errors or exceptional states.
- **No external dependencies** beyond `Decimal`; ensure all logic is self-contained or properly imported.

---

**Note:** When modifying `calculateTavilyCrawlActualCost`, verify input validation, adhere to invariants, and test with boundary cases to prevent subtle bugs in cost computation.