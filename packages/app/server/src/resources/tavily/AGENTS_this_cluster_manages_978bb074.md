# Tavily Resources (packages/app/server/src/resources/tavily)

## Purpose
This cluster manages data types related to Tavily's extraction and crawling processes, defining core data structures for these operations. It facilitates consistent data handling across extraction and crawling modules, enabling integration and processing workflows.

## Boundaries
- **Belongs here:** Type definitions for extraction (`extract/types.ts`) and crawling (`crawl/types.ts`), including interfaces, enums, and data schemas.
- **Does NOT belong here:** Implementation logic, API endpoints, runtime behavior, or business logic; these are purely data contracts. Any operational code or service logic should reside outside these type files.

## Invariants
- **Type Consistency:** All data types must adhere strictly to their defined interfaces; no partial or malformed objects should be accepted.
- **Null Safety:** Fields marked as non-optional must always be present; optional fields can be omitted but, if present, must conform to their types.
- **Versioning:** Given high-churn (5 versions each), avoid breaking changes; prefer additive modifications and deprecations over removals.
- **Data Integrity:** Data structures should not contain cyclic references unless explicitly supported; avoid circular dependencies between types.
- **Immutable Contracts:** Types should be designed to be immutable once instantiated, preventing accidental mutations.

## Patterns
- **Naming:** Use clear, descriptive names matching the entity purpose, e.g., `ExtractResult`, `CrawlStatus`.
- **Error Handling:** When extending types, include error or status fields explicitly; do not embed error states within core data types.
- **Versioning:** Use version tags or comments to track evolution; avoid breaking changes in existing types.
- **Extensibility:** Use union types or extendable interfaces for optional or evolving fields.
- **Documentation:** Each type should include comments explaining its role, especially for complex or non-obvious fields.
- **Separation of Concerns:** Keep extraction and crawling types isolated; avoid sharing types unless necessary, to prevent coupling.

## Pitfalls
- **Churn Risks:** Frequent modifications increase risk of introducing inconsistencies; document breaking changes clearly.
- **Type Mismatches:** Inconsistent use of optional vs. required fields can cause runtime errors; enforce strict typing.
- **Circular Dependencies:** Avoid cross-referencing types between `extract/types.ts` and `crawl/types.ts` unless explicitly designed.
- **Version Drift:** Be cautious when updating types; ensure consumers are compatible, especially given high churn.
- **Misuse of Types:** Do not embed operational logic or side effects within data types; keep them pure data contracts.
- **Nullability Assumptions:** Do not assume optional fields are always present; validate presence before use.

## Dependencies
- **External:** None directly; however, if future extensions involve external libraries (e.g., validation, serialization), ensure they are compatible with the data structures.
- **Internal:** These types are foundational; avoid tight coupling with implementation logic. When extending, respect existing invariants and patterns.

---

*Note:* Given the high modification frequency, maintain rigorous version control and documentation for each type to facilitate safe evolution and integration.