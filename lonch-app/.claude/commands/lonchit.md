# lonchit - Wrap Up and Ship

Use this workflow when you've completed a feature and want to prepare it for GitHub.

**Trigger:** `/lonchit` or user says "lonchit" or "wrap up and ship"

## Execution Steps

When `/lonchit` is triggered, Claude will execute the following steps:

### 1. Run Quality Checks

**Run these BEFORE cleaning code to catch issues early:**

- [ ] Run full test suite: `npm test`
- [ ] Verify all tests pass - DO NOT proceed if failing
- [ ] Check test coverage for new code (aim for >80% on new functions)
- [ ] Run linter: `npx eslint .`
- [ ] Fix any linting errors or warnings
- [ ] Run build: `npm run build`
- [ ] Verify build succeeds with no errors or warnings

**If any checks fail, STOP and fix before proceeding.**

### 2. Self-Review

- [ ] Review `git diff` line by line for unintended changes
- [ ] Check for accidentally committed sensitive data (API keys, passwords, tokens)
- [ ] Verify all new functions have appropriate error handling
- [ ] Ensure new features have corresponding tests (TDD: tests should already exist!)
- [ ] Check that complex logic has explanatory comments (explain "why" not "what")
- [ ] Verify no hardcoded values that should be environment variables

### 3. Security & Performance Check

- [ ] No hardcoded secrets or API keys
- [ ] User inputs are validated and sanitized
- [ ] Authentication/authorization checks in place where needed
- [ ] No console.logs with sensitive data
- [ ] Consider performance implications (N+1 queries, unnecessary re-renders, etc.)
- [ ] Check for memory leaks in long-running processes

### 4. Clean Up Code

- [ ] Remove debug console.logs (keep intentional warnings/errors)
- [ ] Remove completed TODO comments
- [ ] Remove commented-out code blocks
- [ ] Check for unused imports (linter should flag these)
- [ ] Verify no placeholder code remains (e.g., "TODO", "FIXME")
- [ ] Remove any temporary test data or files

### 5. Documentation

- [ ] Add/update JSDoc or TSDoc comments for public functions
- [ ] Document component props (PropTypes or TypeScript interfaces)
- [ ] Update API documentation if endpoints changed
- [ ] Add inline comments for complex logic
- [ ] Update README.md if needed (new features, setup steps)
- [ ] Document new environment variables in .env.example

### 6. Git Commit

- [ ] Review all changed files with `git status` and `git diff`
- [ ] Create descriptive commit message following format:
  ```
  <Type>: <Short summary> (#issue-number if applicable)

  <Detailed description of changes>

  ## Changes
  - Bullet point details
  - What was added/modified/removed

  ## Testing
  - How it was tested
  - Test coverage

  Files changed:
  - file1.jsx: description
  - file2.jsx: description

  Closes #123 (if this commit closes an issue)

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- [ ] Stage and commit all changes: `git add . && git commit`

**Commit Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring without changing behavior
- `test:` Adding or updating tests
- `docs:` Documentation updates
- `chore:` Maintenance tasks, dependencies

### 7. Update GitHub Issue

- [ ] Add completion summary to issue:
  ```bash
  gh issue comment <issue-number> --body "✅ Implementation complete.

  **Changes:**
  - Feature X implemented
  - Tests added with Y% coverage
  - Documentation updated

  **Commit:** <commit-hash>
  **Branch:** <branch-name>"
  ```
- [ ] Update issue labels (remove `in-progress`, add `needs-review` or similar)
- [ ] Reference related issues if applicable

### 8. Update Documentation

- [ ] Update CHANGELOG.md with:
  - Date of changes
  - Features added
  - Bugs fixed
  - Technical details
  - Files modified
  - Link to issue/PR
- [ ] Create/update feature-specific documentation if needed
- [ ] Document new environment variables or configuration

### 9. Push to GitHub

- [ ] Get current branch name: `git branch --show-current`
- [ ] Push branch to origin: `git push origin <branch-name>` (or `git push -u origin <branch-name>` if first push)
- [ ] Confirm push succeeded
- [ ] Provide branch URL for reference

### 10. Summary Report

Generate a summary including:
- **Branch:** Name of the branch
- **Commit:** Short commit hash
- **Issue:** Link to GitHub issue (#123)
- **Files Changed:** List with line counts
- **Features Added:** Bullet points
- **Tests Added:** Coverage info
- **Bugs Fixed:** Bullet points
- **Breaking Changes:** Any breaking changes or migration notes
- **Next Steps:** Create PR, merge to main, deploy, etc.

## Example Output

```
✅ lonchit Complete!

Branch: feature/123-document-management
Commit: 7e0eb0b
Issue: #123
Files Changed: 5 files, +210 insertions, -20 deletions

Features Added:
✓ Document upload with AI extraction
✓ Bulk category operations
✓ Download/delete functionality

Tests Added:
✓ Upload validation tests (95% coverage)
✓ Bulk operation integration tests
✓ Error handling tests

Bugs Fixed:
✓ Race condition in state updates
✓ Category persistence issues

Next Steps:
- Create pull request to main (#123 will auto-close on merge)
- Deploy to staging
- Smoke test in production-like environment
```

## Notes

- DO NOT commit or push if tests are failing
- DO NOT skip quality checks
- Always update CHANGELOG.md
- Get user approval before pushing to remote
