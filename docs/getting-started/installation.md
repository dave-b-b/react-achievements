---
sidebar_position: 1
---

# Installation

Get React Achievements up and running in your project.

## Requirements

- **React** 17.0.0 or higher
- **Node.js** 16.0.0 or higher
- **TypeScript** 4.5.0 or higher (optional, but recommended)

## Package Installation

Install React Achievements using your preferred package manager:

```bash npm2yarn
npm install react-achievements
```

That's it! React is automatically installed as a peer dependency by npm 7+.

## Optional External Dependencies (Legacy UI)

:::info Built-in UI Available
As of v3.6.0, React Achievements includes built-in UI components with no external dependencies. The legacy external dependencies below are optional and will be deprecated in v4.0.0.
:::

If you're using existing code that relies on legacy external UI libraries, install them separately:

```bash npm2yarn
npm install react-toastify react-modal react-confetti react-use
```

## Verifying Installation

Create a test file to verify the installation:

```tsx title="test-installation.tsx"
import { AchievementProvider } from 'react-achievements';

function App() {
  return (
    <AchievementProvider achievements={{}}>
      <div>React Achievements installed successfully!</div>
    </AchievementProvider>
  );
}

export default App;
```

If this compiles without errors, you're ready to go!

## Next Steps

- **[Quick Start](/docs/getting-started/quick-start)** - Build your first achievement system
- **[Simple API Guide](/docs/guides/simple-api)** - Learn the recommended configuration approach

## Troubleshooting

### Module not found

If you get a "Module not found" error:

1. Ensure React Achievements is listed in your `package.json` dependencies
2. Delete `node_modules` and run `npm install` again
3. Clear your bundler cache (e.g., `rm -rf .next/cache` for Next.js)

### TypeScript errors

If you encounter TypeScript errors:

1. Ensure your TypeScript version is 4.5.0 or higher
2. Add `"moduleResolution": "node"` to your `tsconfig.json`
3. Ensure you have `@types/react` installed: `npm install --save-dev @types/react`

### React version conflicts

If you have React version conflicts:

```bash
npm install react-achievements --legacy-peer-deps
```

This installs the package while ignoring peer dependency conflicts.
