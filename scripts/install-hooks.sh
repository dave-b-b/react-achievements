#!/bin/sh
# Install git hooks for the project
# Run with: npm run install-hooks

echo "📦 Installing git hooks..."
echo ""

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo "❌ Error: .git directory not found"
  echo "   Make sure you're in the root of the repository"
  exit 1
fi

# Install pre-commit hook
if [ -f "scripts/hooks/pre-commit" ]; then
  cp scripts/hooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  echo "✅ Pre-commit hook installed"
else
  echo "❌ Error: scripts/hooks/pre-commit not found"
  exit 1
fi

echo ""
echo "✨ Git hooks installed successfully!"
echo ""
echo "The pre-commit hook will now:"
echo "  • Run TypeScript type checking"
echo "  • Run the full test suite"
echo "  • Block commits if checks fail"
echo ""
echo "To bypass the hook (not recommended):"
echo "  git commit --no-verify"
echo ""
