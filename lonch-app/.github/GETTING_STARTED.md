# Getting Started - Development Workflow

This guide walks you through the complete development workflow for starting a new feature.

## Prerequisites

- Git configured and authenticated
- GitHub CLI installed and authenticated (`gh auth status`)
- Node.js and npm installed
- Test coverage package installed (`@vitest/coverage-v8`)

## Quick Start: The "shazam" Command

**Want to skip the manual steps?** Use the automated workflow:

```bash
resume      # Check project state
/shazam     # 🚀 Automates steps 2-6 below!
```

The `shazam` command will:
1. ✅ Check you're on main with clean state
2. ✅ Pull latest changes
3. ✅ Walk you through creating a PRD
4. ✅ Generate tasks with TDD structure
5. ✅ Create GitHub issue automatically
6. ✅ Create feature branch
7. ✅ Mark issue as in-progress
8. ✅ Ready to code with `/process-task-list`

**Result:** From idea to ready-to-code in one command!

Then continue with step 7 (Process Tasks) below.

---

## Complete Workflow: From Idea to Production (Manual Steps)

**Note:** Use `/shazam` to automate steps 2-6, or follow manually below:

### 1. Start Your Session

```bash
resume
```

**What this does:**
- Shows recent git commits
- Displays current branch and status
- Helps you understand where you left off

**Expected output:**
```
Recent commits: ...
Current branch: main
Status: clean
```

### 2. Ensure Clean State

```bash
# Verify you're on main branch
git status

# Pull latest changes
git pull origin main

# Check for existing issues (avoid duplicates)
gh issue list
```

### 3. Create PRD (Product Requirements Document)

```bash
/create-prd
```

**What this does:**
- Claude asks clarifying questions about your feature
- You answer to help define requirements
- PRD is generated in `/tasks/XXXX-prd-feature-name.md`

**Example interaction:**
```
Claude: "What problem does this feature solve?"
You: "Users need to export their data to CSV"

Claude: "What are the key user stories?"
You: "As a user, I want to download my data as CSV so I can analyze it offline"

[PRD is generated and saved]
```

**Output file:** `tasks/0006-prd-data-export.md`

### 4. Generate Tasks from PRD

```bash
/generate-tasks
```

**What this does:**
- Claude reads the PRD
- Analyzes existing codebase
- Generates high-level parent tasks
- Waits for your approval
- You say "Go"
- Claude generates detailed sub-tasks with TDD structure
- **Automatically creates GitHub issue**

**Example interaction:**
```
Claude: "I have generated the high-level tasks:
1.0 Create export service
2.0 Build UI components
3.0 Add API endpoints
4.0 Testing & validation

Ready to generate sub-tasks? Respond with 'Go' to proceed."

You: "Go"

Claude: [Generates detailed sub-tasks with tests]
Claude: "GitHub issue #45 created: PRD-0006: Data Export"
```

**Output files:**
- `tasks/tasks-0006-prd-data-export.md`
- GitHub Issue #45 created

### 5. Create Feature Branch

**IMPORTANT:** Use the issue number from step 4!

```bash
# Option 1: Feature branch with issue number
git checkout -b feature/45-data-export

# Option 2: PRD-based branch
git checkout -b prd/0006-data-export
```

**Branch naming conventions:**
- `feature/123-description` - New feature with issue number
- `fix/123-description` - Bug fix with issue number
- `prd/XXXX-description` - PRD-based work
- `refactor/description` - Code refactoring

### 6. Mark Issue as In Progress

```bash
gh issue edit 45 --add-label "in-progress"

gh issue comment 45 --body "🚀 Started implementation

**Branch:** feature/45-data-export
**Following TDD:** Tests before implementation
**Next:** Task 1.0 - Create export service"
```

### 7. Process Tasks (TDD Implementation)

```bash
/process-task-list
```

**What this does:**
- Claude finds the task list for current PRD
- Implements each sub-task following TDD:
  1. Write test(s) first
  2. Run test (should FAIL - RED)
  3. Implement feature
  4. Run test (should PASS - GREEN)
  5. Refactor if needed
  6. Mark sub-task complete

**Important:** Claude will:
- Ask permission before starting each sub-task
- Wait for you to say "yes" or "y" before proceeding
- Run tests before marking tasks complete
- Commit when all sub-tasks in a parent task are done

**Your role:**
- Review the code before saying "yes"
- Provide feedback if needed
- Approve moving to next sub-task

### 8. Monitor Progress

While working, you can:

```bash
# Check test status
npm test

# Check coverage
npm run test:coverage

# View task list progress
cat tasks/tasks-0006-prd-data-export.md

# Check issue status
gh issue view 45
```

### 9. Complete Feature - "lonchit"

When all tasks are done:

```bash
lonchit
```

**What this does (in order):**

1. **Quality Checks:**
   - Run full test suite
   - Run linter
   - Run build
   - Check test coverage (>80%)

2. **Self-Review:**
   - Review git diff
   - Check for sensitive data
   - Verify error handling
   - Ensure all tests exist

3. **Security & Performance:**
   - No hardcoded secrets
   - Input validation in place
   - No console.logs with sensitive data

4. **Clean Up:**
   - Remove debug code
   - Remove TODO comments
   - Remove unused imports

5. **Documentation:**
   - Add/update JSDoc comments
   - Update README if needed
   - Document env variables

6. **Git Commit:**
   - Create descriptive commit message
   - Include issue reference (#45)
   - Include test coverage info

7. **Update GitHub Issue:**
   - Add completion summary
   - Update labels

8. **Documentation:**
   - Update CHANGELOG.md
   - Update feature docs

9. **Push to GitHub:**
   - Push branch to origin

10. **Summary Report:**
    - Shows what was done
    - Suggests next steps

**Expected output:**
```
✅ lonchit Complete!

Branch: feature/45-data-export
Commit: abc1234
Issue: #45
Files Changed: 8 files, +450 insertions, -20 deletions

Features Added:
✓ CSV export functionality
✓ Download button in UI
✓ Export service with streaming

Tests Added:
✓ Export service tests (92% coverage)
✓ UI component tests (95% coverage)
✓ Integration tests passing

Next Steps:
- Create pull request (#45 will auto-close on merge)
- Deploy to staging
- Test in production-like environment
```

### 10. Create Pull Request

```bash
gh pr create \
  --title "feat: add data export functionality" \
  --body "Implements PRD-0006: Data Export

## Summary
Users can now export their data to CSV format for offline analysis.

## Changes
- CSV export service with streaming support
- Download button in data table
- Export API endpoint
- Comprehensive tests (92% coverage)

## Testing
- Unit tests: All passing
- Integration tests: All passing
- Manual testing: Verified export works with large datasets

## Screenshots
[Add if applicable]

Closes #45"
```

### 11. Merge When Ready

After review (or if self-merging):

```bash
# Merge and delete branch
gh pr merge 45 --squash --delete-branch
```

**This will:**
- Squash commits into one
- Merge to main
- Delete feature branch
- Auto-close issue #45 (because PR body said "Closes #45")

---

## Quick Reference Commands

| Step | Command | Purpose |
|------|---------|---------|
| Start | `resume` | Check project state |
| **🚀 Quick Start** | **`/shazam`** | **Automate PRD → Tasks → Branch → Issue** |
| Sync | `git pull origin main` | Get latest changes |
| PRD | `/create-prd` | Define feature requirements (manual) |
| Tasks | `/generate-tasks` | Break into tasks + create issue (manual) |
| Branch | `git checkout -b feature/XX-name` | Create feature branch (manual) |
| Status | `gh issue edit XX --add-label "in-progress"` | Mark issue in-progress (manual) |
| Build | `/process-task-list` | TDD implementation |
| Ship | `lonchit` | Quality checks + commit + push |
| PR | `gh pr create` | Create pull request |
| Merge | `gh pr merge XX --squash` | Merge to main |

**Note:** Use `/shazam` to automate the manual steps (PRD through Status). Or do them manually if you prefer more control.

---

## TDD Workflow (During /process-task-list)

For each sub-task:

```bash
# 1. Write test first
# Claude creates: src/services/exportService.test.js

# 2. Run test (should FAIL)
npm test -- src/services/exportService.test.js
# ❌ FAIL - function doesn't exist yet (RED)

# 3. Implement feature
# Claude creates: src/services/exportService.js

# 4. Run test (should PASS)
npm test -- src/services/exportService.test.js
# ✅ PASS (GREEN)

# 5. Refactor if needed
# Improve code while tests protect you

# 6. Mark complete
# Claude marks sub-task [x] in task list
```

---

## Troubleshooting

### "No PRD found"
- Make sure you ran `/create-prd` first
- Check that PRD file exists in `/tasks/` directory

### "Task list already exists"
- You may have already run `/generate-tasks` for this PRD
- Check `/tasks/tasks-XXXX-prd-name.md` exists

### "Tests failing during lonchit"
- STOP - do not proceed with lonchit
- Fix failing tests first
- Run `npm test` to see failures
- Fix and re-run until all pass

### "Coverage too low"
- Add more tests for new code
- Aim for >80% coverage on new code
- Run `npm run test:coverage` to see report

### "Branch conflicts"
- You may be behind main
- Run `git fetch && git status`
- If behind: `git pull --rebase origin main`
- Resolve conflicts and continue

### "Issue not created"
- Check GitHub CLI auth: `gh auth status`
- May need additional scopes: `gh auth refresh`
- Manually create issue if needed:
  ```bash
  gh issue create --title "PRD-XXXX: Feature Name" \
    --body "$(cat tasks/XXXX-prd-name.md)" \
    --label "feature,prd-XXXX"
  ```

---

## Best Practices

### ✅ DO:
- Always start with `resume` to check state
- Pull latest before creating new branch
- Follow TDD: tests before implementation
- Review each sub-task before approving
- Run tests frequently during development
- Keep commits focused and descriptive
- Reference issue numbers in commits (#45)
- Update issue with progress comments

### ❌ DON'T:
- Skip writing tests first (breaks TDD)
- Commit without tests passing
- Push with failing tests or linting errors
- Commit sensitive data (API keys, passwords)
- Start new feature without syncing main
- Work on main branch directly
- Skip the lonchit checklist steps

---

## Example: Complete Feature Flow

```bash
# === SESSION START ===
resume
git pull origin main

# === PLAN FEATURE ===
/create-prd
# Answer questions about "User notification preferences"
# PRD created: tasks/0007-prd-notification-preferences.md

# === GENERATE TASKS ===
/generate-tasks
# High-level tasks generated
# You: "Go"
# Detailed tasks + GitHub issue #50 created
# File: tasks/tasks-0007-prd-notification-preferences.md

# === START WORK ===
git checkout -b feature/50-notification-preferences
gh issue edit 50 --add-label "in-progress"

# === IMPLEMENT (TDD) ===
/process-task-list
# Claude: "Starting Task 1.1: Write tests for preferences service"
# You: "yes"
# [Claude writes tests]
# Claude: "Starting Task 1.2: Implement preferences service"
# You: "yes"
# [Claude implements, tests pass]
# ... continue for all sub-tasks ...

# === COMPLETE & SHIP ===
lonchit
# All quality checks pass
# Committed, pushed, issue updated

# === CREATE PR ===
gh pr create --title "feat: add notification preferences" \
  --body "Implements PRD-0007. Closes #50"

# === MERGE ===
gh pr merge 50 --squash --delete-branch
# ✅ Feature complete!
```

---

## Next Steps

Now you're ready to build features using this workflow!

1. Try it with a small feature first
2. Get comfortable with the TDD cycle
3. Use the GitHub integration to track progress
4. Iterate and improve your process

**Remember:** The workflow is designed to ensure quality, not slow you down. Following TDD and the quality checks will save you debugging time later!

For more details, see:
- `.github/WORKFLOWS.md` - Detailed workflow documentation
- `.github/GITHUB_CLI_REFERENCE.md` - GitHub CLI commands
- `.claude/workflows/` - PRD and task generation rules
