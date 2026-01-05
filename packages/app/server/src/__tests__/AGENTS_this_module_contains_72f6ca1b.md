# Server Test Module (packages/app/server/src/__tests__/server.test.ts)

## Purpose
This module contains unit and integration tests for the server component, validating core functionalities, API endpoints, and internal logic to ensure correctness and stability during development and refactoring.

## Boundaries
- **Belongs here:** Tests for server logic, API routes, middleware, and internal modules directly related to server behavior.
- **Does NOT belong here:** Implementation code, configuration files, or tests for unrelated modules (e.g., frontend, database schemas). Test fixtures or mocks should be minimal and specific to server logic.

## Invariants
- Tests should not depend on external systems unless explicitly mocked.
- Test setup/teardown must cleanly initialize and dispose resources to prevent side effects.
- Test cases must be deterministic; avoid flaky tests caused by timing or external dependencies.
- Test data should be isolated; no shared mutable state across tests.
- Test execution order should be non-dependent; tests must be independent and idempotent.
- Error handling within tests must explicitly verify failure modes, not assume success.

## Patterns
- Use consistent naming conventions for test descriptions: "should [expected behavior] when [condition]".
- Follow the Arrange-Act-Assert pattern strictly.
- Mock external dependencies explicitly; use dedicated mock modules or libraries.
- Use descriptive assertions; avoid generic `expect(true).toBe(true)`.
- Maintain clear separation between setup, execution, and verification phases.
- Use test-specific configurations or environment variables to isolate test environment.
- When modifying, preserve test isolation; avoid shared state or side effects.

## Pitfalls
- Frequent modifications (high churn) suggest instability; avoid over-reliance on fragile tests.
- Be cautious with mocking: over-mocking can hide integration issues.
- Watch for tests that depend on timing or order, which can cause flakiness.
- Avoid testing implementation details; focus on behavior.
- Beware of tests that are too broad or too narrow, reducing maintainability.
- Frequent updates in `server.test.ts` indicate areas prone to breakage; review for brittle assertions or tightly coupled tests.

## Dependencies
- **Testing Framework:** Ensure consistent use of Jest (or the relevant framework) APIs.
- **Mocking Libraries:** Use dedicated mocking tools (e.g., jest.mock) to isolate external modules.
- **Environment Variables:** Use test-specific environment configs to prevent interference with production settings.
- **Internal Modules:** When extending tests, import only the necessary modules; avoid deep coupling.
- **CI/CD Integration:** Confirm tests are compatible with CI pipelines, considering frequent churn hotspots.

---

**Note:** Given the high modification frequency, prioritize stabilizing tests, avoiding brittle assertions, and documenting assumptions explicitly to aid future maintenance.