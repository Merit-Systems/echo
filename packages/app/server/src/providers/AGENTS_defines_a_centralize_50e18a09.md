# ProviderFactory.ts Intent Node

## Purpose
Defines a centralized factory for mapping AI models to their respective providers, enabling dynamic provider selection based on model type for chat, image, and video AI models. It abstracts provider instantiation logic, facilitating extensibility and consistency across media types.

## Boundaries
- **Belongs:** Creation functions `createChatModelToProviderMapping`, `createImageModelToProviderMapping`, `createVideoModelToProviderMapping`; provider registration logic; model-to-provider mapping logic.
- **Does NOT belong:** Actual provider implementations; model definitions; external API integrations; UI or client-facing code; unrelated configuration or environment setup.

## Invariants
- The functions `createChatModelToProviderMapping`, `createImageModelToProviderMapping`, `createVideoModelToProviderMapping` must return valid, non-null mappings.
- Mappings should be immutable after creation; no runtime modifications.
- Provider instances must be correctly associated with their respective models; mismatches can cause runtime errors.
- The factory should handle unknown models gracefully, either by defaulting or throwing explicit errors.
- Null-safety: All model keys and provider values in mappings must be non-null.
- Ordering of entries in mappings is not guaranteed; rely on explicit keys rather than positional assumptions.
- No side effects or external state mutations during mapping creation.

## Patterns
- Use dedicated creation functions (`createChatModelToProviderMapping`, etc.) for each media type.
- Maintain naming conventions: functions prefixed with `create` and ending with `Mapping`.
- Encapsulate provider instantiation within these functions; avoid direct provider creation outside.
- Handle unknown or unsupported models explicitly, e.g., throw errors or fallback to defaults.
- Prefer immutable objects for mappings; avoid mutability after creation.
- Document expected model keys and provider types for each mapping.
- Use consistent error handling: throw descriptive errors on misconfigurations.
- Avoid circular dependencies; this module should not depend on provider implementations directly.

## Pitfalls
- Churn: Frequent modifications to `ProviderFactory.ts` suggest evolving model-provider mappings; ensure changes are well-tested.
- Misalignment: Incorrect model keys or provider associations can cause runtime failures.
- Overly dynamic mappings: Avoid runtime modifications; prefer static, predictable mappings.
- Forgetting to update all three creation functions when adding new models or providers.
- Implicit assumptions about model types or provider capabilities; validate mappings explicitly.
- Dependency on external modules (`createChatModelToProviderMapping`, etc.) must be correct; misconfigurations here can break the entire factory.
- Null or undefined values in mappings can cause runtime errors; enforce non-null constraints.
- High churn indicates the need for comprehensive tests covering all model-provider combinations.

## Dependencies
- External functions: `createChatModelToProviderMapping`, `createImageModelToProviderMapping`, `createVideoModelToProviderMapping`.
- These functions must be correctly implemented to produce valid, complete mappings.
- Ensure these functions are imported correctly and are up-to-date with supported models and providers.
- No direct dependencies on provider implementations; only on the mapping creation functions.
- External models and providers should be validated against the mappings to prevent mismatches.
- Be cautious of version mismatches; frequent updates imply the need for regression testing.

---

**Summary:**  
This node encapsulates the logic for dynamically mapping media models to providers, serving as a critical abstraction layer. Agents must understand the creation patterns, invariants, and potential pitfalls—especially churn and dependency correctness—to maintain robustness and extensibility.