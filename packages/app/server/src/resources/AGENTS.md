# [Semantic Cluster: createTavilyTransaction Functions & e2b Module]

## Purpose
This cluster encapsulates the creation of `Transaction` objects via two overloaded `createTavilyTransaction` functions, handling different input/output types (`TavilyCrawlInput`/`TavilyCrawlOutput` and `TavilyExtractInput`/`TavilyExtractOutput`) and a `cost`. It centralizes transaction instantiation logic, likely for data processing or API interactions, within the `resources/e2b/e2b.ts` module.

## Boundaries
- **Belongs here:** All logic related to constructing `Transaction` instances from specific input/output pairs and associated costs.
- **Does NOT belong here:** Any logic unrelated to transaction creation, such as data validation, external API calls, or business rules outside transaction instantiation. These should be handled in separate modules or services.

## Invariants
- The `createTavilyTransaction` functions **must** return a `Transaction` object that correctly encapsulates the provided input, output, and cost.
- The `Transaction` must **not** be null; functions should guarantee a valid, fully populated object.
- The `cost` parameter **must** be a `Decimal` and should be validated or sanitized before use if necessary.
- When multiple versions of `createTavilyTransaction` exist, they **must** handle their respective input/output types correctly without mixing logic.
- The module `e2b.ts` is frequently modified; avoid introducing breaking changes to function signatures or exported entities unless necessary.

## Patterns
- Use explicit type annotations for all parameters, especially for `input`, `output`, and `cost`.
- Maintain consistent naming conventions: `createTavilyTransaction`, with input/output types clearly indicating their purpose.
- When modifying, respect the existing function overloads; avoid changing parameter order or types unless refactoring.
- Handle errors explicitly; if input validation is needed, throw descriptive exceptions.
- Ensure that the `Transaction` creation logic is atomic and side-effect free.
- Document assumptions about input/output types, especially if transformations are involved.
- Use the `Decimal` type consistently for `cost`, avoiding floating-point inaccuracies.

## Pitfalls
- **Churn-related risks:** Frequent modifications to `createTavilyTransaction` suggest instability; avoid breaking existing overloads.
- **Type confusion:** Mixing input/output types across overloads can lead to runtime errors; verify correct function usage.
- **Null-safety:** Ensure that `input` and `output` are validated or guaranteed non-null before use.
- **Dependency coupling:** Since the module depends on `Transaction`, ensure that any changes to `Transaction` are compatible with these functions.
- **Overloading ambiguity:** Overloads with similar signatures may cause confusion; document usage clearly.
- **External dependencies:** No external imports are used, but if added, ensure they do not introduce side effects or version conflicts.

## Dependencies
- **Transaction:** Must be imported and used consistently; understand its constructor or factory pattern.
- **Input/Output Types:** `TavilyCrawlInput`, `TavilyCrawlOutput`, `TavilyExtractInput`, `TavilyExtractOutput` — know their structure and any required transformations.
- **Decimal:** Use the `Decimal` type for `cost`, ensuring proper validation and precision.
- **Module `e2b.ts`:** Contains the core logic; modifications should preserve existing function signatures and behaviors unless refactoring is intentional.

---

**Summary:**  
Agents modifying or extending `createTavilyTransaction` functions must respect the input/output contracts, avoid breaking existing overloads, and ensure the `Transaction` objects are correctly instantiated without side effects. The `e2b.ts` module is a hot spot for frequent changes; careful version control and testing are essential. Proper handling of `Decimal` costs and input validation is critical to maintain data integrity.