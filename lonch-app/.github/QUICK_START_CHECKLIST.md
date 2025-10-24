# Quick Start Checklist

Use this as a quick reference when starting a new feature.

## ☑️ Pre-Work Checklist

```
[ ] Run: resume
[ ] Check: git status (should be on main, clean)
[ ] Run: git pull origin main
[ ] Check: gh issue list (no duplicate features)
```

## ☑️ Planning Phase

```
[ ] Run: /create-prd
[ ] Answer Claude's questions about the feature
[ ] Review generated PRD file: tasks/XXXX-prd-feature-name.md
[ ] Run: /generate-tasks
[ ] Review high-level tasks
[ ] Say: "Go" to generate detailed sub-tasks
[ ] Note the GitHub issue number created (e.g., #45)
```

## ☑️ Setup Phase

```
[ ] Create branch: git checkout -b feature/XX-feature-name
[ ] Mark issue in-progress: gh issue edit XX --add-label "in-progress"
[ ] Add start comment: gh issue comment XX --body "🚀 Started work..."
```

## ☑️ Development Phase (TDD)

```
[ ] Run: /process-task-list
[ ] For each sub-task:
    [ ] Claude writes tests FIRST
    [ ] Run tests (should FAIL - RED)
    [ ] Claude implements feature
    [ ] Run tests (should PASS - GREEN)
    [ ] Refactor if needed
    [ ] You approve: "yes" or "y"
    [ ] Claude marks sub-task complete
[ ] Verify: npm test (all passing)
[ ] Verify: npm run test:coverage (>80%)
```

## ☑️ Completion Phase

```
[ ] Run: lonchit
[ ] Quality Checks:
    [ ] Tests pass
    [ ] Linter passes
    [ ] Build succeeds
    [ ] Coverage >80%
[ ] Self-Review:
    [ ] Git diff reviewed
    [ ] No sensitive data
    [ ] Error handling present
    [ ] Tests exist
[ ] Security:
    [ ] No hardcoded secrets
    [ ] Input validation
    [ ] No sensitive console.logs
[ ] Cleanup:
    [ ] Debug code removed
    [ ] TODOs removed
    [ ] Unused imports removed
[ ] Documentation:
    [ ] JSDoc comments added
    [ ] README updated (if needed)
    [ ] Env vars documented
[ ] Git:
    [ ] Descriptive commit created
    [ ] Issue referenced (#XX)
    [ ] Coverage noted
[ ] GitHub:
    [ ] Issue updated
    [ ] Labels updated
[ ] Push:
    [ ] Branch pushed to origin
```

## ☑️ PR & Merge

```
[ ] Create PR: gh pr create
    [ ] Title: "feat: description"
    [ ] Body includes: "Closes #XX"
    [ ] Testing section filled
[ ] Review (if applicable)
[ ] Merge: gh pr merge XX --squash --delete-branch
[ ] Verify issue auto-closed
```

## ☑️ Post-Merge

```
[ ] Switch to main: git checkout main
[ ] Pull latest: git pull origin main
[ ] Verify feature merged
[ ] Deploy to staging (if applicable)
[ ] Test in staging
```

---

## 🚨 Stop and Fix If:

- ❌ Tests are failing
- ❌ Linter has errors
- ❌ Build fails
- ❌ Coverage below 80% on new code
- ❌ Git diff shows sensitive data
- ❌ Merge conflicts exist

**Don't proceed until these are resolved!**

---

## 💡 Quick Commands

```bash
# Status check
git status
gh issue list

# Test commands
npm test                    # Run all tests
npm run test:coverage      # Check coverage
npm test -- path/to/file   # Run specific test

# GitHub commands
gh issue view XX           # View issue
gh issue edit XX --add-label "label"
gh issue comment XX --body "message"
gh pr create               # Create PR
gh pr view XX             # View PR

# Branch commands
git checkout -b feature/XX-name
git branch --show-current
git push -u origin feature/XX-name

# Recovery commands
git status                 # Check what's changed
git diff                   # See changes
git stash                  # Temporarily save changes
git reset --soft HEAD~1    # Undo last commit (keep changes)
```

---

## 📋 Decision Tree

**Starting a new feature?**
- → Yes: Follow full checklist above
- → No: Skip to relevant section

**Have a PRD already?**
- → Yes: Start at "Generate Tasks"
- → No: Start at "Planning Phase"

**Mid-development?**
- → Continue at "Development Phase"
- → Check task list: `cat tasks/tasks-XXXX-prd-name.md`

**Ready to ship?**
- → Start at "Completion Phase"
- → Run `lonchit`

**Need to fix something?**
- → Make changes
- → Run tests
- → Commit with: `git commit -m "fix: description"`
- → Push

---

Print this checklist or bookmark this file for quick reference!
