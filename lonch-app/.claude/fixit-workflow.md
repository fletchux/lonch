# fixit - Bug Fixing Workflow

**Purpose:** Streamline bug discovery, documentation, and resolution with TDD approach

**Trigger:** User says "fixit" or "fix a bug"

---

## Overview

The `fixit` workflow guides you through bug fixing from discovery to deployment:
1. Gather information through conversational questions
2. Create structured bug report
3. Create GitHub issue
4. Set up bug-fix branch
5. Follow TDD to implement fix
6. Verify and ship

**Key Difference from `/shazam`:**
- `/shazam` = New features (PRD → Tasks → Implementation)
- `fixit` = Bug fixes (Bug report → Test → Fix → Verify)

---

## Workflow Steps

### Step 1: Information Gathering (Conversational)

Ask the user these questions in a natural, conversational way:

#### Question 1: What's Happening?
"Tell me what's happening. Describe the bug or issue you're seeing."

**Purpose:** Get the user's perspective in their own words
**Example responses:**
- "The login button doesn't work on mobile"
- "Documents aren't showing up after upload"
- "Users are getting kicked out randomly"

#### Question 2: Where Is This Happening?
"Where are you seeing this? Which page, view, or feature?"

**Purpose:** Identify the location/scope
**Follow-up if needed:** "Is it a specific component or the whole page?"

**Example responses:**
- "On the Project Dashboard, in the documents section"
- "Login page on iPhone"
- "Everywhere - happens randomly"

#### Question 3: What Should Happen Instead?
"What's the expected behavior? What should happen instead?"

**Purpose:** Understand the correct/intended behavior
**Example responses:**
- "Users should be able to click login and go to dashboard"
- "Documents should appear in the list immediately"
- "Users should stay logged in for 7 days"

#### Question 4: Can You Reproduce It?
"Can you reproduce this bug consistently? If so, what are the steps?"

**Purpose:** Get reproduction steps for testing
**If yes:** "Walk me through the exact steps"
**If no:** "What were you doing when it happened?"

**Example responses:**
- "Yes - open app, click login, enter credentials, click submit - nothing happens"
- "Sometimes - seems to happen after being idle for a while"
- "Not sure - it just happened once"

#### Question 5: Technical Details (Optional)
"Do you have any error messages, screenshots, or console errors?"

**Purpose:** Gather technical evidence
**Be flexible:** User might not have these - that's okay

**Example responses:**
- "Yes, console shows 'TypeError: Cannot read property...'"
- "I have a screenshot"
- "No error message, it just doesn't work"

#### Question 6: How Urgent Is This?
"How urgent is this issue? Does it block critical functionality?"

**Purpose:** Determine severity
**Help them categorize:**
- **Critical:** App broken, can't use core features, data loss
- **High:** Major feature broken, workaround exists
- **Medium:** Minor issue, cosmetic with some impact
- **Low:** Nice-to-have, rare edge case

---

### Step 2: Create Bug Report

Based on answers, create bug report file: `bugs/YYYY-MM-DD-short-description.md`

**Filename generation:**
- Date: Current date (YYYY-MM-DD)
- Description: Kebab-case from bug summary (e.g., "login-button-not-working")

**Use template:** Copy structure from `bugs/BUG-REPORT-TEMPLATE.md`

**Fill in:**
- Description (from Q1)
- Location (from Q2)
- Expected vs Actual Behavior (from Q3)
- Reproduction Steps (from Q4)
- Technical Details (from Q5)
- Severity (from Q6)
- Status: "Open"
- Reporter: User's name or "You"

---

### Step 3: Create GitHub Issue

Create a GitHub issue with the bug details:

```bash
gh issue create \
  --title "Bug: [Short Title]" \
  --body "$(cat bugs/YYYY-MM-DD-short-description.md)" \
  --label "bug,[severity]"
```

**Labels to use:**
- `bug` (always)
- `critical` / `high` / `medium` / `low` (severity)
- Additional: `ui`, `backend`, `mobile`, etc. (if relevant)

**Capture the issue number** (e.g., #47)

---

### Step 4: Create Bug-Fix Branch

**⚠️ CRITICAL: ALWAYS CREATE A BRANCH - NEVER WORK ON MAIN!**

Before any bug fix work begins, you MUST:
1. Check current branch with `git branch`
2. If on `main`, switch to main and pull latest: `git checkout main && git pull`
3. Create a new bug-fix branch

Create branch following naming convention:

```bash
git checkout -b bug/XX-short-description
```

Where:
- `XX` = GitHub issue number (e.g., 47)
- `short-description` = Kebab-case bug summary

**Example:** `bug/47-login-button-not-working`

**Update bug report:**
- Add GitHub issue number
- Add branch name
- Change status to "In Progress"

---

### Step 5: Mark Issue as In Progress

```bash
gh issue edit XX --add-label "in-progress"

gh issue comment XX --body "🔧 Started investigating bug

**Bug Report:** bugs/YYYY-MM-DD-short-description.md
**Branch:** bug/XX-short-description
**Approach:** TDD (write failing test → fix → verify)

**Next Steps:**
1. Write failing test that reproduces the bug
2. Implement fix
3. Verify test passes
4. Run full test suite
5. Manual verification"
```

---

### Step 6: TDD Fix Process

Guide the user through Test-Driven Development:

#### 6.1: Write Failing Test

"Let's write a test that reproduces this bug. This test should fail right now."

**Purpose:**
- Proves you've captured the bug
- Prevents regression in the future
- Gives clear success criteria

**Example:**
```javascript
// This test should FAIL initially
it('should redirect to dashboard after successful login', async () => {
  // Setup
  render(<LoginPage />);

  // Reproduce the bug
  fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

  // This assertion will fail (proving bug exists)
  await waitFor(() => {
    expect(window.location.pathname).toBe('/dashboard');
  });
});
```

**Verify it fails:**
```bash
npm test -- path/to/test/file
```

#### 6.2: Implement Fix

"Now let's fix the bug. Make the minimal change needed to pass the test."

**Guidelines:**
- Keep changes focused
- Follow existing code patterns
- Don't over-engineer
- Fix one thing at a time

#### 6.3: Verify Test Passes

```bash
# Run the specific test
npm test -- path/to/test/file

# Should now PASS
```

#### 6.4: Run Full Test Suite

```bash
npm test
```

**Purpose:** Check for regressions (make sure nothing else broke)

**If tests fail:**
- Investigate what broke
- Adjust fix or add more tests
- Repeat until all tests pass

#### 6.5: Manual Verification

"Let's manually test this to make sure it works in the browser."

**Steps:**
1. Start dev server: `npm run dev`
2. Follow reproduction steps from bug report
3. Verify bug is fixed
4. Test related functionality
5. Check different browsers/devices if relevant

---

### Step 7: Update Bug Report

Update the bug report file with findings:

**Add:**
- Root cause analysis
- Solution description
- Files modified
- Verification results

**Change status:** "Open" → "Fixed"

---

### Step 8: Complete (Use /lonchit)

"Ready to wrap up? Let's use `/lonchit` to finalize."

**Or manually:**

1. **Review changes:**
```bash
git status
git diff
```

2. **Run quality checks:**
```bash
npm test       # All tests pass
npx eslint .   # No errors
npm run build  # Build succeeds
```

3. **Commit:**
```bash
git add .
git commit -m "fix: [short description] (#XX)

[Detailed description]

## Bug
- [What was broken]

## Root Cause
- [Why it was happening]

## Solution
- [What was changed]

## Testing
- Added test that reproduces bug
- Test now passes
- All existing tests pass

Fixes #XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

4. **Update GitHub issue:**
```bash
gh issue comment XX --body "✅ Bug fixed and tested

**Root Cause:** [Brief explanation]

**Solution:** [What was changed]

**Testing:**
- ✅ Unit test added and passing
- ✅ Full test suite passing
- ✅ Manual verification complete

**Commit:** [commit-hash]"

gh issue edit XX --remove-label "in-progress" --add-label "fixed"
```

5. **Push to remote:**
```bash
git push -u origin bug/XX-short-description
```

6. **Update CHANGELOG.md** (add to "Fixed" section)

---

### Step 9: Ready State Confirmation

Display summary to user:

```
🔧 Bug Fix Complete!

**Bug Report:** bugs/YYYY-MM-DD-short-description.md
**GitHub Issue:** #XX - [Bug Title]
**Branch:** bug/XX-short-description
**Status:** Fixed

**Summary:**
- ✅ Failing test written
- ✅ Bug fixed
- ✅ All tests passing
- ✅ Manual verification complete
- ✅ Committed and pushed

**Next Steps:**
1. Create pull request to main
2. Get code review if needed
3. Merge to main
4. Deploy and verify in production
5. Close GitHub issue after verification

**Create PR:**
gh pr create --title "Fix: [Bug Title] (#XX)" --body "Fixes #XX"
```

---

## Error Handling

### If Not on Main Branch

```
⚠️  Not on main branch (currently on: branch-name)
You can fix bugs from any branch, but it's recommended to start from main.

Options:
1. Continue from current branch
2. Stash changes and switch to main
3. Commit current work first

What would you like to do?
```

### If Uncommitted Changes

```
⚠️  You have uncommitted changes

Options:
1. Commit them first
2. Stash them: git stash
3. Create bug-fix branch anyway (changes will come with you)

What would you like to do?
```

### If GitHub CLI Not Authenticated

```
⚠️  GitHub CLI not authenticated
Run: gh auth login

You can still:
- Create bug report locally
- Create branch manually
- Fix the bug
- Create GitHub issue later
```

### If Can't Reproduce Bug

```
ℹ️  Can't reproduce the bug consistently?

That's okay! Document what you know:
- When did it happen?
- What were you doing?
- Any patterns you've noticed?

We'll investigate and try to find reproduction steps.
```

---

## Tips for Effective Bug Fixing

### Before You Start
- Take a screenshot if possible
- Note any error messages
- Try to reproduce it 2-3 times
- Check if others can reproduce it

### During Investigation
- Use browser DevTools console
- Check network tab for failed requests
- Look for patterns in when it occurs
- Test in different browsers if needed

### Writing Tests
- Test should fail before fix
- Test should pass after fix
- Test should be clear and focused
- Test should prevent regression

### Fixing
- Make minimal changes
- Fix one bug at a time
- Don't refactor while fixing (separate PRs)
- Follow existing code patterns

### Verification
- Test the specific bug fix
- Test related functionality
- Run full test suite
- Manual testing in real scenario

---

## Integration with Existing Workflows

### Starting a Session
- "start lonch feature" menu includes "Fix a bug" option
- Selecting it triggers this workflow

### Completing Work
- Use `/lonchit` to wrap up (same as features)
- Or follow manual steps above

### Documentation
- Bug reports stored in `bugs/` directory
- Linked to GitHub issues
- Referenced in CHANGELOG.md (Fixed section)

---

## Differences from Feature Development

| Aspect | Feature (/shazam) | Bug (fixit) |
|--------|------------------|-------------|
| **Document** | PRD | Bug Report |
| **Planning** | Tasks & sub-tasks | Direct to fix |
| **Branch** | feature/XX-name | bug/XX-name |
| **Approach** | TDD for new code | TDD to reproduce bug |
| **Focus** | Build something new | Fix something broken |
| **Questions** | What should it do? | What's wrong? |

---

## Notes

- **Be flexible:** Every bug is different
- **Be conversational:** Don't interrogate, discuss
- **Be thorough:** Good documentation prevents future confusion
- **Be patient:** Some bugs are tricky to reproduce
- **Be systematic:** Follow TDD for quality

---

*Last Updated: 2025-10-24*
*Part of the Claude Code workflow system*
