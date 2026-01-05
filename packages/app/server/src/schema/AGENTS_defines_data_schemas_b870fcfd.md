# Schema Code Area (packages/app/server/src/schema)

## Purpose
Defines data schemas and validation logic for image processing (gemini.ts) and chat completions (completions.ts), establishing structured data contracts used throughout the server.

## Boundaries
- **Belongs here:** JSON schema definitions, type interfaces, validation functions, and related utility functions for image and chat data.
- **Does NOT belong here:** Business logic, API route handlers, database interactions, or UI components. Keep schema definitions isolated from operational code.

## Invariants
- All JSON schemas must be valid and conform to JSON Schema standards (`json_schema` dependency).
- Data objects must satisfy their respective schemas before processing; validation should be enforced at entry points.
- Null values are disallowed unless explicitly permitted in schema definitions.
- The order of properties in schemas should follow the defined sequence to ensure consistency.
- Schema versioning must be managed carefully; frequent modifications (noted in hot-churn modules) require backward compatibility checks.
- Dependencies like `json_object` and `format` are used for schema validation and formatting; their correct usage ensures data integrity.

## Patterns
- Use consistent naming conventions: `CamelCase` for types/interfaces, `snake_case` for schema files.
- Validation functions should be invoked synchronously where possible; asynchronous validation is only for external or complex checks.
- Error handling: return detailed validation errors, avoid silent failures.
- When extending schemas, use composition (`allOf`, `anyOf`) rather than duplication.
- Maintain clear separation between schema definitions and utility functions to facilitate testing and updates.
- Use `needed` and `section` modules for conditional or optional schema parts, following existing patterns.

## Pitfalls
- Frequent modifications in `gemini.ts` and `completions.ts` increase risk of schema drift or versioning issues.
- Avoid circular dependencies between modules; `json_schema` and `json_object` should be used carefully to prevent import cycles.
- Null-safety: ensure schemas explicitly specify `null` where nullable; implicit nullability can cause runtime errors.
- Be cautious with external dependencies (`exist`, `tools`); improper usage can lead to validation failures or inconsistent data.
- Schema evolution must consider existing data; breaking changes can cause deserialization errors.
- Do not embed business logic within schema files; keep them purely declarative.

## Dependencies
- **exist:** Use for existence checks within validation logic; ensure proper null/undefined handling.
- **format:** Apply for string formatting, pattern matching, and data normalization within schemas.
- **json_object:** Facilitate conversion between JSON data and internal representations; ensure consistent usage.
- **json_schema:** Core for defining and validating JSON schemas; adhere to JSON Schema standards.
- **needed:** Manage optional or conditional schema parts; follow existing patterns for optional fields.
- **section:** Organize schema components into logical sections; use for clarity and modularity.
- **text:** Use for string validation, error messages, and user-facing descriptions.
- **tools:** Utility functions for schema manipulation, validation, and data transformations; leverage as per existing patterns.

---

**Note:** Given the high churn in both modules, agents should prioritize understanding schema versioning strategies and validation patterns to prevent introducing breaking changes or inconsistencies.