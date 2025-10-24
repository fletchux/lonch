# Development Workflows

This document contains reusable workflows for common development tasks with Claude Code.

## Branch Naming Convention

Use consistent branch naming for better organization and traceability:

- **Feature:** `feature/descriptive-name` or `feature/123-descriptive-name` (with issue number)
- **Bug fix:** `fix/issue-description` or `fix/123-issue-description`
- **Hotfix:** `hotfix/critical-issue`
- **Refactor:** `refactor/component-name`
- **PRD work:** `prd/XXXX-feature-name` (matches PRD number, e.g., `prd/0005-email-integration`)

**Examples:**
- `feature/user-authentication`
- `fix/123-login-redirect-bug`
- `prd/0006-notification-system`

## GitHub Issue & Project Management

### Creating Issues from PRDs

When a PRD is approved and task list generated:

1. **Create GitHub issue:**
   ```bash
   gh issue create --title "PRD-XXXX: Feature Name" \
     --body "$(cat tasks/XXXX-prd-feature-name.md)" \
     --label "feature,prd-XXXX"
   ```

2. **Link to task file** in issue description
3. **Add to project board** (if using GitHub Projects)
4. **Reference in branch name** when starting work

### During Development

- **Move issue to "In Progress"** when starting work
- **Reference issue number** in all related commits (e.g., `feat: add login form #123`)
- **Update issue** with progress notes or blockers if needed
- **Link related issues** if dependencies exist

### Issue Labels

Recommended labels for organization:
- `feature` - New functionality
- `bug` - Something broken
- `enhancement` - Improvement to existing feature
- `prd-XXXX` - Links to specific PRD
- `blocked` - Waiting on something
- `needs-testing` - Implementation done, testing needed

## "lonchit" - Wrap Up and Ship

Use this workflow when you've completed a feature and want to prepare it for GitHub.

**Trigger phrase:** "lonchit" (or "wrap up and ship")

### Checklist

When you say "lonchit", Claude will execute the following steps:

#### 1. Run Quality Checks

**Run these BEFORE cleaning code to catch issues early:**

- [ ] Run full test suite: `npm test` (or `pytest`, etc.)
- [ ] Verify all tests pass - DO NOT proceed if failing
- [ ] Check test coverage for new code (aim for >80% on new functions)
- [ ] Run linter: `npm run lint`
- [ ] Fix any linting errors or warnings
- [ ] Run type checker if using TypeScript: `tsc --noEmit`
- [ ] Run build: `npm run build` (or `vite build`)
- [ ] Verify build succeeds with no errors or warnings

**If any checks fail, STOP and fix before proceeding.**

#### 2. Self-Review

- [ ] Review `git diff` line by line for unintended changes
- [ ] Check for accidentally committed sensitive data (API keys, passwords, tokens)
- [ ] Verify all new functions have appropriate error handling
- [ ] Ensure new features have corresponding tests (TDD: tests should already exist!)
- [ ] Check that complex logic has explanatory comments (explain "why" not "what")
- [ ] Verify no hardcoded values that should be environment variables

#### 3. Security & Performance Check

- [ ] No hardcoded secrets or API keys
- [ ] User inputs are validated and sanitized
- [ ] Authentication/authorization checks in place where needed
- [ ] No console.logs with sensitive data
- [ ] Consider performance implications (N+1 queries, unnecessary re-renders, etc.)
- [ ] Check for memory leaks in long-running processes

#### 4. Clean Up Code

- [ ] Remove debug console.logs (keep intentional warnings/errors)
- [ ] Remove completed TODO comments
- [ ] Remove commented-out code blocks
- [ ] Check for unused imports (linter should flag these)
- [ ] Verify no placeholder code remains (e.g., "TODO", "FIXME")
- [ ] Remove any temporary test data or files

#### 5. Documentation

- [ ] Add/update JSDoc or TSDoc comments for public functions
- [ ] Document component props (PropTypes or TypeScript interfaces)
- [ ] Update API documentation if endpoints changed
- [ ] Add inline comments for complex logic
- [ ] Update README.md if needed (new features, setup steps)
- [ ] Document new environment variables in .env.example

#### 6. Git Commit

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

#### 7. Update GitHub Issue

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

#### 8. Update Documentation

- [ ] Update CHANGELOG.md with:
  - Date of changes
  - Features added
  - Bugs fixed
  - Technical details
  - Files modified
  - Link to issue/PR
- [ ] Create/update feature-specific documentation if needed
- [ ] Document new environment variables or configuration

#### 9. Push to GitHub

- [ ] Get current branch name: `git branch --show-current`
- [ ] Push branch to origin: `git push origin <branch-name>` (or `git push -u origin <branch-name>` if first push)
- [ ] Confirm push succeeded
- [ ] Provide branch URL for reference

#### 10. Summary Report

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

### Example Output

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

## Troubleshooting & Rollback

### Push Rejected (Behind Remote)

```bash
# Check remote status
git fetch
git status

# If you're behind, rebase
git pull --rebase origin <branch-name>

# Resolve any conflicts, then:
git add .
git rebase --continue

# Push again
git push origin <branch-name>
```

### Tests Failing After Implementation

**DO NOT commit or push failing tests.**

1. Review the failing test output
2. Fix the implementation or update the test if requirements changed
3. Re-run tests until passing
4. If blocked, commit work-in-progress to a draft branch and ask for help

### Build Broken

```bash
# Revert last commit (keeps changes staged)
git reset --soft HEAD~1

# Fix the issues
# ... make fixes ...

# Re-run build to verify
npm run build

# Recommit
git commit -m "fix: corrected build errors"
```

### Accidentally Committed Sensitive Data

**STOP. Do not push.**

```bash
# Remove the file from staging
git reset HEAD <file-with-secret>

# Remove secret from file
# Edit the file and remove sensitive data

# Amend the commit
git add <file-with-secret>
git commit --amend --no-edit

# If already pushed, you'll need to force push (DANGEROUS)
# Better: rotate the secret and make a new commit removing it
```

### Wrong Branch

```bash
# If you haven't committed yet
git stash
git checkout <correct-branch>
git stash pop

# If you already committed
git log  # Note the commit hash
git checkout <correct-branch>
git cherry-pick <commit-hash>
git checkout <wrong-branch>
git reset --hard HEAD~1  # Remove from wrong branch
```

## "shazam" - Launch New Feature

**The ultimate feature kickstart command!**

Use this workflow when you want to start a new feature from scratch with full automation.

**Trigger phrase:** "shazam"

### What It Does

Automates the complete setup for a new feature:

1. **Pre-flight Checks:**
   - Verifies you're on main branch
   - Checks for uncommitted changes
   - Pulls latest from origin/main

2. **Create PRD:**
   - Interactive Q&A about your feature
   - Generates detailed PRD document
   - Saves to `/tasks/XXXX-prd-feature-name.md`

3. **Generate Tasks:**
   - Analyzes PRD and codebase
   - Creates parent tasks
   - Generates TDD-structured sub-tasks
   - **Automatically creates GitHub issue**

4. **Create Branch:**
   - Creates `feature/XX-feature-name` branch
   - XX is the auto-generated issue number

5. **Update GitHub:**
   - Marks issue as "in-progress"
   - Adds setup completion comment

6. **Ready to Code:**
   - Everything set up for `/process-task-list`
   - TDD workflow ready to go

### Expected Output

```
✨ SHAZAM! Feature setup complete!

📋 PRD: tasks/0006-prd-notification-system.md
📝 Tasks: tasks/tasks-0006-prd-notification-system.md
🎫 Issue: #45 - Notification System
🌿 Branch: feature/45-notification-system
🏷️  Status: in-progress

Ready to code! Next steps:
1. Review task list
2. Start: /process-task-list
3. Follow TDD workflow

When done: lonchit
```

### Prerequisites

- On main branch
- Clean working directory
- GitHub CLI authenticated
- Latest code pulled

## Other Common Workflows

### "Quick Commit"
For small changes that don't need full documentation.
- Clean code
- Create simple commit message
- Push to current branch

### "Feature Review"
Before creating a PR, review the feature:
- Check all files changed
- Verify tests pass
- Review CHANGELOG entry
- Suggest improvements

### "Release Prep"
Prepare for a release:
- Update version numbers
- Generate release notes from CHANGELOG
- Tag the release
- Create GitHub release

---

**Note:** These workflows are executed by Claude Code and can be customized based on your project needs.
