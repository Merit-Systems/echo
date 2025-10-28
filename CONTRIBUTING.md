# Contributing to Echo

Thank you for your interest in contributing to Echo! We're building user-pays AI infrastructure that helps developers monetize their AI applications without fronting costs. Every contribution helps make AI development more accessible and sustainable.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Bounties](#bounties)
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community and Support](#community-and-support)

## Code of Conduct

By participating in this project, you agree to be respectful, inclusive, and constructive. We aim to create a welcoming environment for all contributors regardless of background or experience level.

## Bounties

**Get paid to contribute to Echo!**

We offer bounties for specific features, bug fixes, and improvements. This is a great way to get started with open source contributions while earning rewards for your work.

[**View available bounties →**](https://terminal.merit.systems/Merit-Systems/echo/bounties)

To claim a bounty:

1. Check the [bounties page](https://terminal.merit.systems/Merit-Systems/echo/bounties) for available tasks
2. Comment on the bounty to express interest
3. Submit your work via pull request
4. Receive payment once your PR is merged

New bounties are added regularly, so check back often!

## Ways to Contribute

### 🐛 Report Bugs

If you find a bug, please [open an issue](https://github.com/Merit-Systems/echo/issues/new) with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (OS, Node version, browser, etc.)
- Screenshots or code snippets if applicable

### 💡 Suggest Features

Have an idea? We'd love to hear it! [Open a feature request](https://github.com/Merit-Systems/echo/issues/new) with:

- A clear description of the feature
- Use cases and examples
- Why this would benefit Echo users
- Any implementation ideas you might have

### 📝 Improve Documentation

Documentation improvements are always welcome! This includes:

- Fixing typos or unclear explanations
- Adding examples or tutorials
- Improving API documentation
- Translating documentation

### 🔧 Submit Code Changes

Ready to code? Check our [open issues](https://github.com/Merit-Systems/echo/issues) for ideas, or propose your own changes.

## Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **pnpm**: 10.0.0 or higher
- **PostgreSQL**: Required for running Echo Control locally
- **Git**: For version control

### Initial Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/echo.git
   cd echo
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   pnpm local-setup
   ```

4. **Set up the database** (for Echo Control)

   ```bash
   cd packages/app/control
   ./setup-db.sh
   # Or manually:
   npx prisma generate
   npx prisma db push
   ```

5. **Start development servers**

   From the root directory:

   ```bash
   pnpm dev
   ```

   This starts both Echo Control (localhost:3000) and Echo Server simultaneously.

## Development Workflow

### Creating a Branch

Use descriptive branch names with prefixes:

```bash
git checkout -b feature/add-anthropic-support
git checkout -b fix/balance-calculation-error
git checkout -b docs/improve-quickstart
git checkout -b refactor/simplify-auth-flow
```

### Making Changes

1. Make your changes in focused, logical commits
2. Write or update tests for your changes
3. Ensure all tests pass: `pnpm test:all`
4. Run linting: `pnpm lint`
5. Check types: `pnpm type-check`
6. Format code: `pnpm format`

### Testing Your Changes

```bash
# Run all tests
pnpm test:all

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Test in a specific package
pnpm --filter @merit-systems/echo-react-sdk test
```

## Project Structure

Echo is a monorepo organized as follows:

```
echo/
├── packages/
│   ├── app/
│   │   ├── control/          # Echo Control Plane (Next.js app)
│   │   └── server/           # Echo Server (Express proxy)
│   ├── sdk/
│   │   ├── ts/              # Core TypeScript SDK
│   │   ├── react/           # React SDK
│   │   ├── next/            # Next.js SDK
│   │   ├── aix402/          # AI SDK 402 payment protocol
│   │   └── auth-js-provider/# Auth.js provider
│   └── tests/               # Integration and smoke tests
├── templates/               # Starter templates
└── docs/                    # Documentation
```

### Key Packages

- **Echo Control** (`packages/app/control`): User-facing dashboard, authentication, billing
- **Echo Server** (`packages/app/server`): Proxy server for LLM requests with metering
- **Echo TS SDK** (`packages/sdk/ts`): Foundation for all framework-specific SDKs
- **Echo React SDK** (`packages/sdk/react`): React hooks and components
- **Echo Next SDK** (`packages/sdk/next`): Next.js App Router integration

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Prefer explicit types over `any`
- Use interfaces for public APIs, types for internal structures
- Enable strict mode in `tsconfig.json`

### Imports

- **Always use absolute imports** with the `@` syntax, not relative imports
- Use kebab-case for TypeScript files
- Group imports: external packages → internal packages → local files

```typescript
// ✅ Good
import { useState } from 'react';
import { generateText } from 'ai';

import { useEchoAuth } from '@/hooks/use-echo-auth';
import { Button } from '@/components/button';

// ❌ Bad
import { Button } from '../../../components/button';
```

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Use TypeScript for prop types
- Follow kebab-case for component filenames

```typescript
// user-avatar.tsx
export function UserAvatar({ user }: UserAvatarProps) {
  // Implementation
}
```

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`, `api-client.ts`)
- **Components**: PascalCase (`UserProfile`, `ApiKeyList`)
- **Functions/Variables**: camelCase (`getUserBalance`, `apiKey`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_KEY_PREFIX`, `MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

### Feature Flags

When working with feature flags:

- Use as few places as possible to reduce undefined behavior
- Store flag names in an enum (TypeScript) or const object (JavaScript)
- Use SCREAMING_SNAKE_CASE for flag names
- Gate flag-dependent code with validation checks

```typescript
// ✅ Good
enum FeatureFlags {
  ANTHROPIC_SUPPORT = 'anthropic_support',
  USAGE_ANALYTICS = 'usage_analytics',
}

if (flags[FeatureFlags.ANTHROPIC_SUPPORT] === true) {
  // Feature-specific code
}
```

### Custom Properties (Analytics)

- Store event/property names in enums or const objects when used in 2+ places
- Follow existing naming conventions (consult maintainers if unsure)
- Never change existing event names without discussion (breaks analytics)

### Code Quality

- Follow DRY (Don't Repeat Yourself) principles where appropriate
- Write self-documenting code with clear variable names
- Add comments for complex logic or non-obvious decisions
- Keep functions small and focused on a single responsibility
- Handle errors appropriately with meaningful messages

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear, semantic commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change or bug fix)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `ci`: CI/CD configuration changes

### Scope (optional)

The scope indicates which package is affected:

- `control`: Echo Control
- `server`: Echo Server
- `react-sdk`: React SDK
- `next-sdk`: Next.js SDK
- `ts-sdk`: TypeScript SDK
- `templates`: Starter templates
- `docs`: Documentation

### Examples

```bash
feat(react-sdk): add support for streaming responses

fix(server): correct token counting for Claude models

docs(templates): add environment setup guide for next-chat

refactor(control): simplify balance calculation logic

test(ts-sdk): add integration tests for provider initialization
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`pnpm test:all`)
2. ✅ Code is linted (`pnpm lint`)
3. ✅ Types are valid (`pnpm type-check`)
4. ✅ Code is formatted (`pnpm format`)
5. ✅ Documentation is updated (if applicable)
6. ✅ Changes are tested locally

### Submitting Your PR

1. **Push your branch** to your fork

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** against the `main` branch with:
   - **Clear title**: Summarize the change in one line
   - **Description**: Explain what, why, and how
   - **Related issues**: Link any related issues
   - **Screenshots**: Include for UI changes
   - **Breaking changes**: Clearly mark any breaking changes
   - **Testing**: Describe how you tested the changes

3. **Template Example**:

   ```markdown
   ## Description

   Adds support for Anthropic Claude models in the Echo Server.

   ## Motivation

   Users have requested support for Claude models. This PR adds routing and metering for Anthropic's API.

   ## Changes

   - Added Anthropic provider configuration
   - Implemented token counting for Claude models
   - Updated documentation with Claude examples
   - Added integration tests

   ## Testing

   - ✅ Unit tests pass
   - ✅ Integration tests added and passing
   - ✅ Manually tested with Claude 3.5 Sonnet
   - ✅ Tested metering accuracy

   ## Breaking Changes

   None

   ## Related Issues

   Closes #123
   ```

### PR Review Process

1. **Automated checks** must pass (CI/CD, linting, tests)
2. **At least one maintainer** will review your PR
3. **Address feedback** by pushing new commits to your branch
4. **Squashing commits** is not required; we squash on merge

### After Your PR is Merged

- Delete your branch (GitHub will prompt you)
- Pull the latest changes to your local `main`
- Celebrate! 🎉 You're now an Echo contributor!

## Testing

### Test Types

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test interactions between components
- **End-to-end tests**: Test complete user flows

### Writing Tests

- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies appropriately
- Test both success and failure scenarios
- Aim for high coverage on critical paths

### Running Tests

```bash
# All tests
pnpm test:all

# Specific package
pnpm --filter @merit-systems/echo-react-sdk test

# Watch mode
pnpm --filter @merit-systems/echo-react-sdk test:watch

# Coverage
pnpm --filter @merit-systems/echo-react-sdk test:coverage
```

## Documentation

Good documentation is crucial for adoption and maintenance.

### Code Documentation

- Use JSDoc comments for public APIs
- Include examples in documentation
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes

````typescript
/**
 * Initializes the Echo client with authentication and provider configuration.
 *
 * @param config - Configuration options for the Echo client
 * @param config.apiKey - Echo API key (optional, can use environment variable)
 * @param config.baseUrl - Custom base URL for Echo server (optional)
 * @returns Initialized Echo client instance
 *
 * @example
 * ```typescript
 * const echo = initEcho({
 *   apiKey: process.env.ECHO_API_KEY,
 * });
 * ```
 */
export function initEcho(config: EchoConfig): EchoClient {
  // Implementation
}
````

### README Updates

Update relevant README files when:

- Adding new features
- Changing APIs or configuration
- Adding new packages or templates
- Updating setup instructions

### Examples and Templates

When adding examples:

- Include clear comments
- Show common use cases
- Demonstrate best practices
- Keep examples simple and focused

## Community and Support

### Getting Help

- **Discord**: Join our [Discord server](https://discord.gg/merit) for real-time help
- **GitHub Discussions**: Ask questions and share ideas
- **GitHub Issues**: Report bugs or request features
- **Twitter/X**: Follow [@merit_systems](https://twitter.com/merit_systems) for updates

### Contributing to Discussions

- Be respectful and constructive
- Help others when you can
- Share your Echo use cases and learnings
- Provide feedback on proposals

### Recognition

All contributors are recognized in our:

- GitHub contributors page
- Release notes (for significant contributions)
- Community shoutouts on Twitter/Discord

## License

By contributing to Echo, you agree that your contributions will be licensed under the [Apache 2.0 License](./LICENSE).

---

## Questions?

If you have questions about contributing, feel free to:

- Open a [GitHub Discussion](https://github.com/Merit-Systems/echo/discussions)
- Ask in our [Discord server](https://discord.gg/merit)
- Reach out to the maintainers

Thank you for contributing to Echo! 🚀
