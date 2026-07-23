# Gemini String Parsing Utilities

## Purpose
This module encapsulates string parsing functions used across the application, providing core utilities for interpreting and transforming string data in a consistent manner. It serves as a foundational layer for handling complex string manipulations related to Gemini data formats or protocols.

## Boundaries
- **Belongs here:** All string parsing logic specific to Gemini data formats; utility functions for string transformations; helper functions for pattern matching within Gemini-related strings.
- **Does NOT belong here:** Business logic unrelated to string parsing; network communication code; data storage or database interactions; UI rendering or presentation logic; external API integrations outside string processing.

## Invariants
- Parsing functions must handle null, undefined, or malformed input gracefully, returning predictable fallback values or errors.
- String transformations should preserve data integrity; avoid side effects or mutations of input strings.
- Regular expressions or pattern matching used must be consistent and optimized for performance; avoid regex patterns that are overly broad or inefficient.
- Functions should be pure; no external state mutations or side effects.
- When parsing multiple tokens, order of operations must be strictly maintained to ensure correct interpretation.
- Error handling must be explicit; functions should throw or return errors in a way that callers can reliably handle.

## Patterns
- Use descriptive, camelCase naming conventions for functions (e.g., `parseToken`, `matchPattern`).
- Consistently validate input parameters at the start of each function; return early on invalid data.
- Prefer explicit error returns over silent failures.
- When parsing tokens, always document expected input formats and output structures.
- Use regex patterns that are pre-compiled if reused frequently; avoid recreating regex objects on each call.
- Maintain clear separation between parsing logic and string manipulation utilities.
- Encapsulate complex parsing logic into small, testable functions.
- Document assumptions about input string formats and expected outputs.

## Pitfalls
- Frequently modified `string-parsing.ts` indicates high churn; modifications may introduce regressions or subtle bugs.
- Overly broad regex patterns can cause performance issues or incorrect parsing.
- Null or undefined inputs are common; neglecting null-safety leads to runtime errors.
- Misordering token parsing steps can produce incorrect results.
- Not handling edge cases (empty strings, malformed tokens) can cause downstream failures.
- Adding new parsing patterns without updating invariants or validation can break existing contracts.
- External callers might assume certain invariants; ensure functions document their contracts explicitly.
- Avoid side effects; functions should be deterministic and stateless.

## Dependencies
- No external dependencies are used within this module; ensure any future external imports follow the same pattern of explicit, safe usage.
- If integrating with external string libraries or regex utilities, verify they are performant and reliable.
- Maintain awareness of the module's dependency-free status to prevent unintended coupling.

---

**Note:** Given the high churn and frequent modifications, agents should prioritize understanding the evolution history of `string-parsing.ts` to anticipate potential areas of instability or common modification patterns.