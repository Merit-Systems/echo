# Facilitator Types Module (packages/app/server/src/services/facilitator/x402-types.ts)

## Purpose
Defines core TypeScript types, interfaces, and data structures used within the facilitator service, enabling consistent data contracts and type safety across facilitator-related operations.

## Boundaries
- **Belongs here:** Type definitions, enums, interfaces, utility types specific to facilitator logic.
- **Does NOT belong here:** Implementation logic, function implementations, runtime behavior, or business logic—these should reside in service or handler modules. Avoid placing runtime code or business rules in this types file.

## Invariants
- All type definitions must be explicitly typed; avoid implicit `any`.
- Enums should have explicit string or numeric values to prevent ambiguity.
- Interfaces representing data objects must include all required fields; optional fields should be clearly marked.
- Null-safety: fields that are optional or nullable must be explicitly marked (`?` or `| null`).
- Types should be versioned or annotated if they evolve frequently, to prevent breaking consumers.
- Consistency in naming conventions: e.g., suffixes like `Dto`, `Payload`, `Config` to clarify purpose.
- Avoid circular references between types; use type aliases or interfaces to break cycles.

## Patterns
- Use PascalCase for type and interface names.
- Prefix enum values with the enum name for clarity (e.g., `X402TypeEnum.Value`).
- When defining union types, prefer string literal unions over enums for flexibility unless strict validation is needed.
- Document each type/interface with JSDoc comments explaining its purpose and constraints.
- Maintain a clear separation between data shapes (types) and runtime validation (which should be handled elsewhere).
- Use readonly modifiers for data structures that should be immutable.
- For frequently changing types (noted hot spots), consider versioning or comments indicating stability.

## Pitfalls
- Frequent modifications (hot spots) increase risk of breaking consumers; document changes carefully.
- Nullability and optional fields are common sources of runtime errors; enforce strict null checks.
- Overusing `any` or loose types can lead to type safety erosion; avoid unless absolutely necessary.
- Circular dependencies or overly complex nested types can complicate maintenance.
- Misalignment between type definitions and actual runtime data can cause subtle bugs; ensure types are kept in sync with runtime validation schemas.
- Be cautious with enum values—changing them can break consumers relying on specific string/numeric literals.
- Avoid defining types that are too broad or too narrow, which can cause mismatch issues.

## Dependencies
- This module does not depend on external libraries; it solely defines TypeScript types.
- Ensure that any runtime validation or serialization logic consuming these types adheres to the defined contracts.
- If external validation libraries (e.g., `zod`, `io-ts`) are used elsewhere, maintain alignment between runtime schemas and these type definitions.

---

**Note:** Given the high churn hotspot at this file, prioritize documenting versioning strategies and change impact assessments for modifications to prevent breaking dependent code.