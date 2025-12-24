# Contributing to React Achievements

Thank you for your interest in contributing to React Achievements! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 16.0 or higher
- **npm** (comes with Node.js)
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/react-achievements.git
   cd react-achievements
   ```

### Install Dependencies

Install all required dependencies:

```bash
npm install
```

### Install Git Hooks

We use pre-commit hooks to ensure code quality. Install them with:

```bash
npm run install-hooks
```

This will run TypeScript type checking and Jest tests before each commit.

## Development Workflow

### Key Commands

```bash
# Build the library
npm run build

# Run all tests
npm test

# Run TypeScript type checking
npm run type-check

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Start Storybook for component development
npm run storybook

# Build Storybook for production
npm run build-storybook
```

### Development Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code quality standards below

3. **Write tests** for your changes (see Testing Requirements)

4. **Run the test suite**:
   ```bash
   npm test
   ```

5. **Ensure TypeScript compiles**:
   ```bash
   npm run type-check
   ```

6. **Build the library** to ensure no build errors:
   ```bash
   npm run build
   ```

## Testing Requirements

All new features and bug fixes must include tests. We use:
- **Jest** for test running
- **React Testing Library** for component testing
- **jsdom** environment for DOM testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- ComponentName

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Place test files in `src/__tests__/` directories
- Name test files: `ComponentName.test.tsx` or `functionName.test.ts`
- Follow existing test patterns in the codebase
- Test both success and error cases
- Maintain high test coverage

## Code Quality Standards

### TypeScript

- **TypeScript-first development** - All code must be written in TypeScript
- Use strict type checking (project uses strict mode)
- Avoid `any` types - use proper type definitions
- Export types from `src/core/types.ts` for reusability

### Code Style

- Follow existing patterns and conventions in the codebase
- Use consistent naming:
  - `camelCase` for variables and functions
  - `PascalCase` for components and types
  - `UPPER_SNAKE_CASE` for constants
- Keep functions focused on single responsibility
- Write clear, descriptive variable and function names

### Documentation

- Add JSDoc comments for public APIs
- Update README.md if adding new features
- Update Docusaurus documentation in `docs/` for significant changes
- Include code examples in documentation

### Commit Messages

Write clear, descriptive commit messages:

```bash
# Good commit messages
feat: add IndexedDB storage support
fix: resolve notification race condition
docs: update Simple API guide with new examples
refactor: simplify achievement condition evaluation

# Less helpful commit messages (avoid these)
update code
fix bug
changes
```

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format when possible:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

## Pull Request Process

1. **Ensure all checks pass**:
   - TypeScript compiles without errors
   - All tests pass
   - Linter passes
   - Build succeeds

2. **Create a Pull Request** with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference any related issues (e.g., "Fixes #123")
   - Screenshots/GIFs for UI changes (if applicable)

3. **Respond to review feedback** promptly

4. **Keep your branch updated** with main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

## Project Structure

Understanding the codebase structure will help you contribute effectively:

```
react-achievements/
├── src/
│   ├── core/              # Core functionality
│   │   ├── components/    # UI components (BadgesButton, BadgesModal, etc.)
│   │   ├── storage/       # Storage implementations
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── errors/        # Error handling classes
│   │   └── utils/         # Utility functions
│   ├── providers/         # React context providers
│   ├── hooks/             # React hooks
│   ├── utils/             # Helper utilities (AchievementBuilder, etc.)
│   └── index.ts           # Main export file
├── stories/               # Storybook stories and examples
├── docs/                  # Docusaurus documentation
└── demo/                  # Demo application
```

## Areas for Contribution

We welcome contributions in these areas:

### Bug Fixes
- Check the [issue tracker](https://github.com/dave-b-b/react-achievements/issues) for bugs
- Reproduce the bug and write a failing test
- Fix the bug and ensure tests pass

### New Features
- Discuss major features in an issue first
- Start with documentation (update docs/)
- Implement feature with tests
- Update examples in stories/

### Documentation
- Improve existing documentation
- Add missing examples
- Fix typos or clarify unclear sections
- Update Docusaurus guides in `docs/`

### Testing
- Increase test coverage
- Add edge case tests
- Improve existing tests

### Performance
- Profile and optimize hot paths
- Reduce bundle size
- Improve render performance

## Licensing

By contributing to React Achievements, you agree that your contributions will be licensed under the project's dual license:

- **MIT License** for non-commercial use
- **Commercial License** for commercial use

See the [LICENSE](./LICENSE) and [COMMERCIAL-LICENSE.md](./COMMERCIAL-LICENSE.md) files for details.

## Questions or Need Help?

- Open an [issue](https://github.com/dave-b-b/react-achievements/issues) for bugs or feature requests
- Start a [discussion](https://github.com/dave-b-b/react-achievements/discussions) for questions
- Contact: dave.b.business@gmail.com

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming, inclusive environment for all contributors.

---

**Thank you for contributing to React Achievements!** Your efforts help make this library better for everyone.
