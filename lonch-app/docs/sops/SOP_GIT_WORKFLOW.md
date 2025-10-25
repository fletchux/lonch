# SOP: Git & Commit Conventions

**Purpose:** Maintain clean, meaningful git history that tells the story of our codebase.

**When to use:** Every time you commit code. Every single time.

**Time:** 2-5 minutes per commit (planning what to say)

---

## 📋 TL;DR

```bash
1. Branch naming: feature/description OR bug/XX-description
2. Commit when: Logical unit complete + ALL tests passing
3. Commit message: Type + summary + details + footer
4. Always include Claude Code footer
5. Push regularly (at least daily)
6. Create PRs with descriptive titles and descriptions
```

**Golden Rule:** Your commit message should explain **WHY**, not just what changed.

---

## 🌿 Branch Naming

### Format

```
<type>/<issue-number>-<short-description>

Types: feature | bug | refactor | docs
```

### Examples

**✅ GOOD:**
```bash
feature/shareable-invite-links
bug/13-modal-closes-immediately
bug/14-project-not-in-dashboard
refactor/extract-permissions-hooks
docs/update-firebase-setup-guide
```

**❌ BAD:**
```bash
fix-stuff              # No type, vague
bug-fix                # No issue number, not specific
johns-branch           # Not descriptive
temp                   # No context
feature/PRD-0004       # Use description not PRD number
```

### Creating Branches

**From main:**
```bash
git checkout main
git pull origin main
git checkout -b feature/new-feature-name
```

**From existing feature:**
```bash
git checkout feature/parent-feature
git checkout -b feature/sub-feature-name
```

**📚 Junior Dev Note:**
Always branch from latest `main` unless you're building on someone else's feature (then branch from their branch).

---

## 💬 Commit Messages

### Format

```
<Type>: <One-line summary (50 chars max)>

<Detailed description explaining WHY and WHAT>

<Technical details if needed>

Closes #XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| **Feature:** | New functionality | Feature: Shareable invite links |
| **Fix:** | Bug fixes | Fix: Modal closes immediately |
| **Refactor:** | Code restructuring (no behavior change) | Refactor: Extract fetchProjects function |
| **Docs:** | Documentation only | Docs: Add Firebase email setup guide |
| **Test:** | Adding/fixing tests | Test: Add integration tests for invite flow |
| **Style:** | Formatting, no code change | Style: Fix ESLint warnings |
| **Chore:** | Build, dependencies, etc. | Chore: Update Firestore indexes config |

### Real Examples from This Session

**Example 1: Bug Fix (Bug #14)**
```bash
git commit -m "$(cat <<'EOF'
Fix: Projects not appearing in dashboard after invite acceptance

Root Cause:
- Projects were only fetched when currentUser changed (useEffect dependency)
- After accepting invite, currentUser hadn't changed
- onAccepted callback showed stale projects list without newly joined project
- User had to refresh browser to see the project

Solution:
- Extracted fetchProjects function using useCallback
- Called fetchProjects in onAccepted callback before navigating
- Projects list is now refreshed after invite acceptance
- User sees newly joined project immediately

Changes:
- src/App.jsx:
  - Added useCallback import
  - Extracted fetchProjects as useCallback (lines 53-89)
  - Updated useEffect to use extracted function (lines 91-93)
  - Updated onAccepted callback to refetch projects (lines 296-308)

Testing:
- All 648 tests passing
- ESLint clean
- Manual verification successful

Closes #16

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Example 2: Feature Implementation**
```bash
git commit -m "$(cat <<'EOF'
Feature: Shareable invite links for project collaboration

Implemented PRD-0004:
- Generate shareable links with role and group selection
- Link management interface (view, revoke links)
- Accept invite flow with authentication
- Activity logging for link events
- Email notifications for invitations

Technical highlights:
- inviteLinkService for link generation and validation
- GenerateLinkModal component with role/group selection
- AcceptInviteLinkPage with token validation
- Firestore security rules for invite links collection
- Complete test coverage (648 tests passing)

Testing:
- All automated tests passing
- Manual testing completed per PRD acceptance criteria
- Cross-browser testing (Chrome, Safari, Firefox)

Closes #10

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Example 3: Simple Fix**
```bash
git commit -m "$(cat <<'EOF'
Fix: Missing await in permission check causing infinite loading

Root Cause: Async function not awaited in useEffect

Solution: Added await keyword

Closes #11

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Commit Message Template

Use this helper for consistent formatting:

```bash
git commit -m "$(cat <<'EOF'
<Type>: <One-line summary>

Root Cause (if bug fix):
- [Why it was broken]

Solution (or Description for features):
- [What you changed and why]

Changes:
- [File 1]: [What changed]
- [File 2]: [What changed]

Testing:
- [Test status]
- [Manual testing notes]

Closes #XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## ⏰ When to Commit

### ✅ Commit when:
- Logical unit of work is complete (one feature, one fix, one refactor)
- ALL tests are passing (100%)
- ESLint is clean
- Code is reviewed (by you or Claude)
- You're about to switch context (end of day, etc.)

### ❌ Don't commit:
- Work in progress (broken code)
- Any failing tests
- Debugging code (console.log, commented code)
- Large multi-feature changes (break into smaller commits)
- Before reading the diff (always review what you're committing!)

### 📚 Junior Dev Note:
Think of commits like save points in a video game. You want to save when you're in a good state, not in the middle of a boss fight!

---

## 📦 Committing Workflow

### Step 1: Review Changes

```bash
git status
```

**Check:**
- [ ] All changed files intentional?
- [ ] No unintended files (node_modules, .env, etc.)?
- [ ] All intended changes included?

### Step 2: Review Diff

```bash
git diff
```

**Look for:**
- [ ] Debugging code left behind (console.log, debugger)
- [ ] Commented-out code that should be deleted
- [ ] TODO comments that should be addressed
- [ ] Accidental whitespace changes
- [ ] Code that doesn't match the commit purpose

### Step 3: Stage Changes

```bash
# Stage all changes
git add -A

# OR stage specific files
git add src/components/MyComponent.jsx
git add src/services/myService.js
```

**📚 Junior Dev Note:**
`git add -A` adds ALL changes (new, modified, deleted). Use it when you've reviewed everything. Use individual `git add` when you want to commit only specific files.

### Step 4: Run Tests

```bash
npm test
npx eslint .
```

**Must see:**
```
✅ All tests passing
✅ No ESLint errors
```

**If anything fails:** STOP. Fix it. Don't commit.

### Step 5: Commit

```bash
git commit -m "$(cat <<'EOF'
[Your commit message here]
EOF
)"
```

### Step 6: Push

```bash
# First time pushing branch
git push -u origin feature/your-branch-name

# Subsequent pushes
git push
```

---

## 🔄 Pull Requests

### Creating a PR

```bash
# Via GitHub CLI (recommended)
gh pr create --base main --head feature/your-branch-name

# Or via web interface
# Push branch first, then GitHub will show "Create PR" button
```

### PR Title Format

Same as commit message format:

```
<Type>: <One-line summary>

Examples:
Feature: Shareable invite links for project collaboration
Fix: Modal closes immediately after generating link
Refactor: Extract permissions hooks for reusability
```

### PR Description Template

```markdown
## Summary
[Brief description of what this PR does]

## Changes
- [Key change 1]
- [Key change 2]
- [Key change 3]

## Testing
- [ ] All automated tests passing (XXX/XXX)
- [ ] Manual testing completed
- [ ] ESLint clean
- [ ] No console errors in browser

## Related Issues
Closes #XX
Relates to #YY

## Screenshots (if UI changes)
[Add screenshots or GIFs]

## Checklist
- [ ] Code reviewed (self or peer)
- [ ] Documentation updated
- [ ] No breaking changes (or documented if unavoidable)
```

### Before Requesting Review

- [ ] All commits follow naming conventions
- [ ] Branch is up to date with main
- [ ] All tests passing
- [ ] ESLint clean
- [ ] PR description is complete
- [ ] Linked to GitHub issues
- [ ] Added screenshots if UI changed

---

## 🚫 Common Mistakes

### Mistake #1: Vague Commit Messages
```bash
# ❌ BAD
git commit -m "fixed bug"
git commit -m "updates"
git commit -m "wip"
git commit -m "asdf"

# ✅ GOOD
git commit -m "Fix: Modal closes before showing generated link"
```

**Why bad:** Future you won't know what was fixed or why

### Mistake #2: Massive Commits
```bash
# ❌ BAD: Changed 47 files
git commit -m "Added feature, fixed 3 bugs, refactored services, updated docs"

# ✅ GOOD: Separate commits
git commit -m "Feature: Add invite link generation"
git commit -m "Fix: Modal closing issue"
git commit -m "Refactor: Extract permissions hooks"
git commit -m "Docs: Update setup guide"
```

**Why bad:** Hard to review, hard to revert, hard to understand

### Mistake #3: Committing Broken Code
```bash
$ npm test
❌ 1 failed | 647 passed

$ git commit -m "will fix tests later"  # ❌ NEVER DO THIS
```

**Why bad:** Breaks CI/CD, blocks others, creates technical debt

### Mistake #4: Missing GitHub Issue Reference
```bash
# ❌ BAD
git commit -m "Fix: Bug with modal"

# ✅ GOOD
git commit -m "Fix: Modal closes immediately

Closes #13"
```

**Why bad:** Can't track which commit fixed which issue

### Mistake #5: Not Using Heredoc for Multi-line
```bash
# ❌ BAD (hard to format, easy to mess up)
git commit -m "Fix: Bug
Root cause: callback timing
Solution: moved callback
Closes #13"

# ✅ GOOD (proper formatting)
git commit -m "$(cat <<'EOF'
Fix: Bug with modal

Root cause: callback timing
Solution: moved callback

Closes #13
EOF
)"
```

---

## 🎯 Checklist: Before Every Commit

**Code quality:**
- [ ] All tests passing (100%)
- [ ] ESLint clean
- [ ] No console.log or debugging code
- [ ] No commented-out code
- [ ] Code reviewed (by you at minimum)

**Commit preparation:**
- [ ] Reviewed `git status` (all files intentional?)
- [ ] Reviewed `git diff` (changes make sense?)
- [ ] Commit message follows format
- [ ] Commit message explains WHY
- [ ] GitHub issue referenced if applicable
- [ ] Claude Code footer included

**Branch management:**
- [ ] Branch name follows convention
- [ ] Branch is focused (one feature/bug per branch)
- [ ] Branch is up to date with main (if long-lived)

---

## 🔧 Useful Git Commands

### Daily Workflow

```bash
# Check what changed
git status

# See detailed changes
git diff

# See changes in staged files
git diff --staged

# Stage all changes
git add -A

# Stage specific file
git add path/to/file.js

# Commit
git commit -m "message"

# Push
git push

# Pull latest from main
git checkout main
git pull origin main
```

### Branch Management

```bash
# List all branches
git branch

# Create and switch to new branch
git checkout -b feature/new-branch

# Switch to existing branch
git checkout branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

### Fixing Mistakes

```bash
# Unstage a file
git reset HEAD path/to/file.js

# Discard changes in file
git checkout -- path/to/file.js

# Amend last commit (only if not pushed!)
git commit --amend

# Undo last commit (keeps changes)
git reset --soft HEAD~1

# View commit history
git log --oneline
```

**⚠️ Warning:** Never use `git reset --hard` or `git push --force` to main branch!

---

## 📚 Related Documentation

- **Quality:** [Testing Philosophy SOP](SOP_TESTING_APPROACH.md) - must pass before commit
- **Features:** [PRD Workflow SOP](SOP_PRD_WORKFLOW.md) - committing features
- **Bugs:** [Bug Fixing SOP](SOP_BUG_FIXING.md) - committing bug fixes
- **Overview:** [AI Development Guide](../AI_DEVELOPMENT_GUIDE.md) - the big picture

---

## 📖 Git History as Documentation

**Your git log tells a story:**

```bash
$ git log --oneline

84b037c Update bug report #14 with successful manual testing verification
c8b8a6f Fix: Projects not appearing in dashboard after invite acceptance
a7f9e23 Fix: Modal closes immediately after generating invite link
9e8d12b Fix: Missing Firestore indexes for invite links queries
7c6b01a Fix: Share links loading forever due to missing await
6d5a90f Feature: Shareable invite links for project collaboration
```

**Each commit answers:**
- **What changed?** (from commit title)
- **Why?** (from commit body)
- **When?** (from commit timestamp)
- **Who?** (from commit author)
- **Which issue?** (from Closes #XX)

**Future developers (including you!) will read this to:**
- Understand why decisions were made
- Debug when things break
- Learn from past solutions
- Track feature evolution

**Make it worth reading!**

---

## 🎯 Quick Reference: Commit Format

```bash
git commit -m "$(cat <<'EOF'
<Type>: <50-char summary>

[Blank line]

<Detailed explanation of WHY>
- Point 1
- Point 2

Changes:
- file1.js: what changed
- file2.js: what changed

Testing:
- Test status
- Manual testing notes

Closes #XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

**Last Updated:** 2025-10-24

**See Also:**
- Real examples in `git log`
- GitHub PRs: https://github.com/fletchux/lonch/pulls

**Questions?** Ask in team chat or refer to this SOP.
