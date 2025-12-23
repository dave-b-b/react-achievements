# Git Hooks

This project uses Git hooks to ensure code quality before commits.

## Pre-Commit Hook

The pre-commit hook automatically runs before every commit to ensure:
- ✅ All TypeScript type checking passes
- ✅ All tests pass
- ✅ No broken code is committed

### What It Does

When you run `git commit`, the hook will:
1. Run TypeScript type checking (`npm run type-check`)
2. Run the full test suite (`npm run test:unit`)
3. Block the commit if either check fails
4. Allow the commit if all checks pass

### Installation

#### For New Contributors

Run this command after cloning the repository:

```bash
npm run install-hooks
```

This will copy the hooks from `scripts/hooks/` to `.git/hooks/` and make them executable.

#### Manual Installation

If you prefer to install manually:

```bash
cp scripts/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Bypassing the Hook

**Not recommended**, but if you need to bypass the hook:

```bash
git commit --no-verify
```

**Only use this when:**
- You're committing work-in-progress intentionally
- You're reverting a commit that broke tests
- You have a valid reason to skip checks

**Never bypass for:**
- Failing tests (fix them first!)
- TypeScript errors (fix them first!)
- "I'm in a hurry" (the hook is fast, tests are important!)

### Hook Behavior

**When checks pass:**
```
🔍 Running pre-commit checks...

📝 Type checking...
✅ Type check passed

🧪 Running tests...
✅ All tests passed!
✅ Pre-commit checks complete
```

**When checks fail:**
```
🔍 Running pre-commit checks...

📝 Type checking...
❌ TypeScript errors detected!
   Fix type errors before committing.

[commit blocked]
```

### Performance

The pre-commit hook is designed to be fast:
- Type checking: ~2-5 seconds
- Test suite: ~2-3 seconds
- **Total: ~5-8 seconds**

This ensures you get quick feedback without significantly slowing down your workflow.

### Troubleshooting

#### Hook not running

1. Check if hook is installed:
   ```bash
   ls -la .git/hooks/pre-commit
   ```

2. If not found, install it:
   ```bash
   npm run install-hooks
   ```

3. Verify it's executable:
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

#### Hook always fails

1. Make sure you're in the project root
2. Try running the checks manually:
   ```bash
   npm run type-check
   npm run test:unit
   ```
3. Fix any issues before committing

#### Need to update the hook

The hook source is in `scripts/hooks/pre-commit`. After making changes:

```bash
npm run install-hooks
```

## Why Use Git Hooks?

Git hooks help maintain code quality by:
- **Catching bugs early** - Tests run before code is committed
- **Preventing broken commits** - TypeScript errors are caught immediately
- **Maintaining consistency** - All contributors run the same checks
- **Saving time** - Catch issues locally before pushing to CI/CD
- **Improving confidence** - Know that committed code works

## Other Hooks

Currently only the pre-commit hook is configured. Future hooks could include:
- `pre-push` - Run additional checks before pushing
- `commit-msg` - Enforce commit message format
- `post-merge` - Auto-install dependencies after merging

## Best Practices

1. **Always install hooks** after cloning the repo
2. **Don't bypass hooks** without good reason
3. **Keep hooks fast** - slow hooks get bypassed
4. **Fix issues immediately** - don't commit broken code
5. **Update hooks** when project requirements change

## For Maintainers

### Updating Hooks

1. Edit `scripts/hooks/pre-commit`
2. Test the changes:
   ```bash
   sh scripts/hooks/pre-commit
   ```
3. Install updated hook:
   ```bash
   npm run install-hooks
   ```
4. Commit the changes

### Adding New Hooks

1. Create hook script in `scripts/hooks/[hook-name]`
2. Make it executable: `chmod +x scripts/hooks/[hook-name]`
3. Update `scripts/install-hooks.sh` to install the new hook
4. Document it in this file
5. Test thoroughly before committing

---

**Note**: Git hooks are local to each repository clone. They are NOT automatically shared through git (hooks in `.git/hooks/` are not tracked). That's why we provide installation scripts.
