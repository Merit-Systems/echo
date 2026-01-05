# setupMockEchoControlService Function

## Purpose
Defines a test utility to instantiate a mocked `EchoControlService` with a configurable `balance` (default 100), used to simulate and control echo responses during unit tests.

## Boundaries
- **Belongs here:** Only test setup code related to mocking `EchoControlService`; no production logic.
- **Does NOT belong here:** Actual service implementation, production code, or test cases unrelated to mocking setup. Avoid placing business logic or assertions in this function.

## Invariants
- The `balance` parameter defaults to 100 if unspecified; callers must explicitly set or rely on default.
- The function always returns an instance of `MockedEchoControlService` configured with the provided `balance`.
- The mocked service's methods (e.g., `request`) should be stubbed/stubable to simulate various behaviors; ensure no side effects leak between tests.
- The function should not modify external state; it should produce a fresh mock instance each call.
- The `request` method of the mock should be properly stubbed to return predictable responses, respecting the test scenario.

## Patterns
- Use consistent naming: `setupMockEchoControlService`.
- Always initialize the mock with explicit configuration; prefer default parameters for simplicity.
- When modifying, ensure the mock's `request` method is stubbed with a predictable, test-specific behavior.
- Follow test setup conventions: call `beforeEach` to initialize mocks, avoid global state mutation.
- Use dependency injection patterns to replace real services with mocks during tests.

## Pitfalls
- **Churn:** The function is frequently modified (5 versions), risking inconsistent mock configurations.
- **Incorrect `balance`:** Forgetting to set or override `balance` can lead to misleading test results.
- **Shared state:** Reusing mock instances across tests can cause flaky tests; always instantiate fresh.
- **Stub leakage:** Not properly stubbing `request` can cause tests to pass/fail unpredictably.
- **Ignoring default:** Relying on default `balance` without explicitness can hide test intent.
- **Coupling to implementation:** Changes in `MockedEchoControlService` or `request` signature require updates here.

## Dependencies
- **MockedEchoControlService:** Instantiate and configure with `balance`.
- **request:** Mocked method on the service; ensure proper stubbing in tests.
- **Testing Framework:** Use `beforeEach`, `describe`, `it`, `expect` for test lifecycle and assertions.
- **Streams and Encoders:** Imported but not directly used here; ensure correct handling if extended.
- **Type Safety:** Maintain correct types for `balance` and returned mock instances; avoid type mismatches.

---

*Note:* When modifying `setupMockEchoControlService`, verify the mock's behavior aligns with test expectations, especially regarding `balance` and `request`. Keep the mock isolated and predictable to ensure reliable unit tests.