# Development Workflows

This document contains reusable workflows for common development tasks with Claude Code.

## "Wrap Up and Ship"

Use this workflow when you've completed a feature and want to prepare it for GitHub.

**Trigger phrase:** "wrap up and ship"

### Checklist

When you say "wrap up and ship", Claude will execute the following steps:

#### 1. Clean Up Code
- [ ] Remove debug console.logs (keep intentional warnings/errors)
- [ ] Remove completed TODO comments
- [ ] Check for unused imports
- [ ] Verify no placeholder code remains

#### 2. Git Commit
- [ ] Review all changed files with `git status` and `git diff`
- [ ] Create descriptive commit message following format:
  ```
  <Type>: <Short summary>

  <Detailed description of changes>

  ## <Section 1>
  - Bullet point details

  ## <Section 2>
  - More details

  Files changed:
  - file1.jsx: description
  - file2.jsx: description

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- [ ] Stage and commit all changes

#### 3. Update Documentation
- [ ] Update CHANGELOG.md with:
  - Date of changes
  - Features added
  - Bugs fixed
  - Technical details
  - Files modified
- [ ] Update README.md if needed (new features, setup steps, etc.)
- [ ] Create/update feature-specific documentation if needed
- [ ] Document new environment variables or configuration

#### 4. Push to GitHub
- [ ] Get current branch name
- [ ] Push branch to origin: `git push origin <branch-name>`
- [ ] Confirm push succeeded
- [ ] Provide branch URL for reference

#### 5. Summary Report
Generate a summary including:
- **Branch:** Name of the branch
- **Commit:** Short commit hash
- **Files Changed:** List with line counts
- **Features Added:** Bullet points
- **Bugs Fixed:** Bullet points
- **Breaking Changes:** Any breaking changes or migration notes
- **Next Steps:** Suggested follow-up tasks or PRs

### Example Output

```
✅ Wrap Up and Ship Complete!

Branch: feature/document-management
Commit: 7e0eb0b
Files Changed: 5 files, +210 insertions, -20 deletions

Features Added:
✓ Document upload with AI extraction
✓ Bulk category operations
✓ Download/delete functionality

Bugs Fixed:
✓ Race condition in state updates
✓ Category persistence issues

Next Steps:
- Create pull request to main
- Request code review
- Test in staging environment
```

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
