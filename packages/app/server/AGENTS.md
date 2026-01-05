# Server Configuration Modules (packages/app/server)

## Purpose
This cluster manages configuration files for the server environment, including testing, build, and linting setups. It ensures consistent tooling behavior across development and CI environments.

## Boundaries
- **Belongs here:** `vitest.config.ts`, `tsup.config.ts`, `eslint.config.mjs`—all define environment-specific tooling configurations.
- **Does NOT belong here:** Application business logic, runtime server code, or deployment scripts. These configs are static and do not influence runtime behavior directly.

## Invariants
- All configuration files must export a default configuration object via `defineConfig`.
- Config files should avoid side effects; they are purely declarative.
- The `vitest.config.ts` and `tsup.config.ts` are frequently updated, so agents must handle potential breaking changes or schema updates.
- ESLint config (`eslint.config.mjs`) must adhere to ECMAScript Module syntax and be compatible with the project's linting standards.
- No circular dependencies should exist between configs; each should be self-contained.

## Patterns
- Use `defineConfig` to wrap configuration objects for type safety and consistency.
- Maintain naming conventions: `vitest.config.ts`, `tsup.config.ts`, `eslint.config.mjs`.
- For TypeScript configs, prefer explicit types where possible.
- Handle errors gracefully; configs should fail to load if invalid, but avoid silent failures.
- Keep configurations minimal; extend base configs only when necessary.
- Frequently modified files (5 versions each) suggest the need for careful review when editing to prevent breaking changes.

## Pitfalls
- Modifying `vitest.config.ts` or `tsup.config.ts` without updating related build/test scripts can cause environment failures.
- Changing ESLint config syntax or rules may silently break linting if not validated.
- Overriding default behaviors in configs may lead to inconsistent tooling behavior.
- Frequent churn indicates these configs are sensitive; avoid unnecessary modifications.
- Be cautious with dependencies imported into configs; ensure they are compatible and correctly versioned.

## Dependencies
- `defineConfig` from the relevant configuration libraries (e.g., Vite, Tsup, ESLint). Use it to ensure proper typing and structure.
- External plugins or presets used within configs must be compatible with the current versions.
- Do not introduce runtime dependencies into static configs unless explicitly supported; configs should be self-contained.
- When extending configs, verify that dependencies are correctly installed and compatible with the existing setup.

---

**Summary:**  
This cluster encapsulates static tooling configurations critical for development consistency. Agents must handle frequent updates, avoid breaking invariants, and respect the separation from runtime code. Proper use of `defineConfig` and adherence to naming, syntax, and dependency standards are essential for stability.