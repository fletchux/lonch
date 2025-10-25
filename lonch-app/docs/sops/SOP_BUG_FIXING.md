# SOP: Bug Fixing Workflow ("fixit")

**Purpose:** Systematically diagnose, document, fix, and verify bugs using AI-assisted investigation.

**When to use:** Any time something isn't working as expected.

**Time:** Simple bugs: 15-30 min | Complex bugs: 1-3 hours | Average: 45 min

---

## 📋 TL;DR

```bash
1. Say to Claude: "fixit"
2. Describe what's broken (be specific!)
3. Claude investigates and creates bug report
4. Claude writes failing test that reproduces bug
5. Claude fixes the bug
6. Verify: tests pass + manual testing
7. Commit with detailed message
```

**Key principle:** Document → Test → Fix → Verify (never skip steps!)

---

## 🎯 When to Use This Workflow

### ✅ Use "fixit" workflow when:
- Something worked before and now it doesn't (regression)
- Feature behavior doesn't match requirements
- Error messages appearing in console
- UI not displaying correctly
- Data not saving/loading as expected
- User reports an issue

### ❌ Don't use "fixit" workflow when:
- Building a new feature (use [PRD Workflow](SOP_PRD_WORKFLOW.md))
- Improving existing feature (that's an enhancement, not a bug)
- Refactoring code without changing behavior
- Performance optimization (unless it's causing actual failures)

**Rule of thumb:** If it's broken or wrong, use "fixit". If it's missing or new, use PRD workflow.

---

## 🚀 Step-by-Step Guide

### Step 1: Initiate Bug Fix

**Say to Claude:**
```
"fixit"
```

Claude will respond with questions to understand the bug. Be ready with:

**Essential information:**
- **What's broken?** (Be specific: "Modal closes immediately after clicking Generate Link")
- **Expected behavior:** ("Should stay open and show the generated link")
- **Actual behavior:** ("Modal disappears before I can see the link")
- **How to reproduce:** (Steps to trigger the bug)
- **When did it break?** (After what change? Or always been broken?)

**Good bug report:**
```
You: "fixit"

Claude: "Sure, I'll help you fix a bug. Can you describe what's happening?"

You: "The Generate Link modal in the Share Links tab closes immediately
      after clicking the 'Generate Link' button. I never get to see the
      link to copy it. This should show me the link in a text box with
      a copy button.

      Steps to reproduce:
      1. Go to Project → Members → Share Links
      2. Click '+ Generate Link'
      3. Select role and group
      4. Click 'Generate Link'
      5. Modal closes instantly

      I think it started after we added the onLinkGenerated callback."
```

**📚 Junior Dev Note:**
The more specific you are, the faster Claude can help. Think like a detective - gather evidence before calling for backup!

**Bad bug report:**
```
"The link thing doesn't work"
```
(Which link? What doesn't work? Can't help with this!)

### Step 2: Investigation Phase

Claude will now investigate by:

**1. Reading relevant files:**
```
Claude: "Let me read the GenerateLinkModal.jsx file..."
        [Reads file]

        "I can see the modal has two states: form state and success state.
        The success state should show the generated link. Let me check
        the parent component that uses this modal..."

        [Reads ShareLinksTab.jsx]

        "Found it! The onLinkGenerated callback is being called
        immediately when the link is generated..."
```

**2. Identifying root cause:**
```
Claude: "Root Cause Identified:

        The onLinkGenerated callback is called as soon as the link is
        generated (GenerateLinkModal.jsx line 43), which triggers the
        parent component to close the modal via setShowGenerateModal(false).

        This happens BEFORE the modal can transition to the success
        state that shows the link.

        The callback should only fire when the user clicks 'Done',
        not during generation."
```

**Your role during investigation:**
- Answer clarifying questions
- Confirm the behavior Claude describes
- Provide additional context if needed
- Don't rush - let Claude read all relevant files

### Step 3: Bug Report Creation

Claude will create a detailed bug report in `bugs/YYYY-MM-DD-bug-description.md`

**Bug report structure:**
```markdown
# Bug Report: [Title]

**Date:** 2025-10-24
**GitHub Issue:** #XX
**Reporter:** [Your name]
**Severity:** High | Medium | Low
**Status:** In Progress
**Branch:** bug/XX-bug-description

## Description
[What's broken]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Steps to Reproduce
[Numbered steps]

## Root Cause Analysis
[Technical explanation of WHY it's broken]

## Fix Plan
[How we'll fix it]

## Solution
[Will be filled in after fix]

## Testing
[Test strategy]
```

**Review the bug report:**
- [ ] Description matches your understanding?
- [ ] Root cause makes sense?
- [ ] Fix plan sounds reasonable?

**If something is unclear, ask:**
```
"Why does the callback firing early cause the modal to close?"
"Is there a better way to fix this than moving the callback?"
"Could this affect other parts of the app?"
```

### Step 4: GitHub Issue Creation

Claude will create a GitHub issue:

```bash
gh issue create --title "Bug: [Description]" --body "[Details]"
```

This creates a permanent record and issue number (e.g., #13).

**Why we create issues:**
- Track bugs in project management
- Reference in commit messages ("Closes #13")
- Link to PRs automatically
- Historical record for "when was this fixed?"

**📚 Junior Dev Note:**
GitHub issues are like tickets in a help desk system. They help organize work and track what's been done.

### Step 5: Create Bug Fix Branch

Claude will create a branch:

```bash
git checkout -b bug/XX-short-description
```

**Branch naming convention:**
```
bug/[issue-number]-[brief-description]

Examples:
✅ bug/13-modal-closes-immediately
✅ bug/14-project-not-in-dashboard
❌ bug/fix-stuff (no issue number, vague)
❌ modal-fix (missing "bug/" prefix)
```

### Step 6: Write Failing Test (TDD)

This is the magic step! Claude will write a test that **reproduces the bug**.

**Example:**
```javascript
it('should NOT close modal immediately after link generation', async () => {
  // SETUP: Mock the link generation
  const mockLink = {
    id: 'link-123',
    url: 'http://localhost:5173/invite/token-abc',
    role: 'viewer',
    group: 'client'
  };

  vi.mocked(inviteLinkService.generateInviteLink).mockResolvedValue(mockLink);

  // RENDER: Show the modal
  render(
    <GenerateLinkModal
      projectId="project-123"
      onClose={mockOnClose}
      onLinkGenerated={mockOnLinkGenerated}  // The problematic callback
    />
  );

  // ACTION: Click generate button
  fireEvent.click(screen.getByTestId('generate-button'));

  // WAIT: For link to be generated
  await waitFor(() => {
    expect(screen.getByTestId('generated-link-input')).toBeInTheDocument();
  });

  // ASSERT: Callback should NOT have been called yet
  expect(mockOnLinkGenerated).not.toHaveBeenCalled();  // ❌ This will FAIL

  // ACTION: Now click Done
  fireEvent.click(screen.getByText('Done'));

  // ASSERT: NOW the callback should fire
  expect(mockOnLinkGenerated).toHaveBeenCalledWith(mockLink);  // ✅ This should PASS
});
```

**Why write a failing test first?**
1. **Proves the bug exists:** If test passes without fix, we're testing wrong thing
2. **Prevents regression:** Bug can't come back without test failing
3. **Documents the fix:** Test shows exactly what was broken

**Run the test:**
```bash
npm test -- GenerateLinkModal.test.jsx
```

**You should see:**
```
❌ FAIL GenerateLinkModal.test.jsx
  ● should NOT close modal immediately after link generation
    expect(jest.fn()).not.toHaveBeenCalled()

    Expected number of calls: 0
    Received number of calls: 1  ← Bug confirmed!
```

**📚 Junior Dev Note:**
This feels backwards at first - why write a test that fails on purpose? Because it **proves** we understand the bug. If the test passed, we'd be testing the wrong thing!

### Step 7: Implement the Fix

Now Claude will fix the bug. For our example:

**Before (broken):**
```javascript
// GenerateLinkModal.jsx line 41-45
setGeneratedLink(link);

if (onLinkGenerated) {
  onLinkGenerated(link);  // ❌ Called immediately!
}
```

**After (fixed):**
```javascript
// GenerateLinkModal.jsx line 41-57
setGeneratedLink(link);
// Don't call onLinkGenerated here - let user see the link first

// ... later, add new handleDone function:
function handleDone() {
  // Call onLinkGenerated when user clicks Done
  if (onLinkGenerated && generatedLink) {
    onLinkGenerated(generatedLink);
  }
  onClose();
}

// Update Done button:
<button onClick={handleDone}>Done</button>
```

**Review the fix:**
- [ ] Makes sense given root cause?
- [ ] Minimal changes (doesn't refactor unrelated code)?
- [ ] Comments explain why (not just what)?
- [ ] No debugging code left behind (console.log, etc.)?

### Step 8: Verify Fix

**Run the specific test:**
```bash
npm test -- GenerateLinkModal.test.jsx
```

**Should see:**
```
✅ PASS GenerateLinkModal.test.jsx
  ✓ should NOT close modal immediately after link generation (234ms)
```

**Run full test suite:**
```bash
npm test
```

**Must see:**
```
✅ All 648 tests passing
```

**If any tests fail:**
- STOP immediately
- Fix failing tests first
- Never commit with failing tests
- Ask Claude: "Why did test X start failing?"

**Run ESLint:**
```bash
npx eslint .
```

**Must see:**
```
(no output = success)
```

**📚 Junior Dev Note:**
This is non-negotiable. Failing tests or ESLint errors? Fix them. No excuses, no "I'll do it later."

### Step 9: Manual Testing

Even with tests passing, manually verify the fix:

**Test the exact reproduction steps:**
1. Go to Project → Members → Share Links
2. Click '+ Generate Link'
3. Select role and group
4. Click 'Generate Link'
5. ✅ **Modal stays open**
6. ✅ **See the generated link**
7. ✅ **Can copy the link**
8. Click 'Done'
9. ✅ **Modal closes**
10. ✅ **Link appears in table**

**Test edge cases:**
- Different roles and groups
- Slow network (simulated)
- Multiple links generated in a row
- Canceling before generation completes

**If manual testing fails:**
- Bug isn't actually fixed!
- Go back to Step 6 (more investigation needed)
- Don't proceed until it works

### Step 10: Update Bug Report

Claude will update the bug report with:

**Solution section:**
```markdown
## Solution

### What was changed:

**Before:**
[Code snippet showing bug]

**After:**
[Code snippet showing fix]

**Explanation:**
[Why this fixes the root cause]

### Files Modified:
- ✅ src/components/project/GenerateLinkModal.jsx
- ✅ src/components/project/GenerateLinkModal.test.jsx

### Testing:
- ✅ All 648 tests passing
- ✅ ESLint clean
- ✅ Manual testing successful
```

**Status updated:**
```markdown
**Status:** Fixed & Verified
```

### Step 11: Commit and Push

Follow [Git Conventions SOP](SOP_GIT_WORKFLOW.md) for commit format:

**Example commit:**
```bash
git add -A
git commit -m "$(cat <<'EOF'
Fix: Modal closes immediately after generating invite link

Root Cause:
- onLinkGenerated callback fired during link generation
- Parent component closed modal via callback
- User never saw the success state with the link

Solution:
- Moved onLinkGenerated call from generation to Done button
- Created handleDone() function to call callback before closing
- Modal now shows link before closing

Changes:
- src/components/project/GenerateLinkModal.jsx:
  - Removed onLinkGenerated() call from handleGenerateLink
  - Added handleDone() function (lines 51-57)
  - Updated Done button to call handleDone()
- src/components/project/GenerateLinkModal.test.jsx:
  - Added test for correct callback timing (lines 253-298)

Testing:
- All 648 tests passing
- Manual testing: can see and copy link before modal closes

Closes #13

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

git push -u origin bug/13-modal-closes-immediately
```

**Then create PR:**
```bash
gh pr create --base main --head bug/13-modal-closes-immediately
```

---

## 📖 Real Examples from This Session

We fixed **4 bugs** using this workflow:

### Bug #11: Share Links Loading Forever

**Symptom:** Loading spinner never stops when opening Share Links tab

**Root Cause:** Async permission check never resolved due to missing await

**Fix:** Added await to permission check

**Time:** 25 minutes

**Lesson:** Always await async functions in useEffect!

### Bug #12: Missing Firestore Indexes

**Symptom:** "Query requires an index" error

**Root Cause:** Complex Firestore query needed composite index

**Fix:** Added index definitions to firestore.indexes.json

**Time:** 20 minutes

**Lesson:** Firestore requires indexes for where() + orderBy() combinations

### Bug #13: Modal Closes Immediately

**Symptom:** Can't see generated link

**Root Cause:** Callback fired at wrong time (covered in detail above)

**Fix:** Moved callback to Done button

**Time:** 45 minutes

**Lesson:** Be careful with callback timing in modal state management!

### Bug #14: Project Not in Dashboard

**Symptom:** After accepting invite, project doesn't appear until browser refresh

**Root Cause:** Projects only fetched when currentUser changed (useEffect dependency)

**Fix:** Extracted fetchProjects function, called after invite acceptance

**Time:** 35 minutes

**Lesson:** Consider all triggers for data refetching, not just mount/unmount

**Total:** 4 bugs fixed, 2 hours 5 minutes, zero regressions

---

## 💡 Tips & Tricks

### Effective Bug Descriptions

**DO:**
- ✅ Include exact steps to reproduce
- ✅ Mention when it started breaking (if known)
- ✅ Provide error messages (copy-paste from console)
- ✅ Screenshots or screen recordings (for UI bugs)
- ✅ Mention what you've already tried

**DON'T:**
- ❌ "It's broken" (what is "it"?)
- ❌ "Doesn't work for me" (works for others?)
- ❌ Skip reproduction steps
- ❌ Paraphrase error messages (copy exact text!)

### Debugging Tips

**When stuck:**
1. Add console.log to see what values are
2. Check browser DevTools Network tab (for API calls)
3. Check Firestore in Firebase Console (for data issues)
4. Use React DevTools to inspect component state
5. Ask Claude to explain the code flow

**Common causes by symptom:**
- **Infinite loading:** Forgotten await, promise never resolves
- **Data not saving:** Security rules blocking write, or wrong collection
- **UI not updating:** State not set, missing dependency in useEffect
- **Random errors:** Race condition, async timing issue
- **Works sometimes:** Missing null/undefined checks

### Test-Driven Debugging

**Best practice: Always write the failing test first!**

Benefits:
- Confirms you understand the bug
- Prevents regression (bug can't come back silently)
- Documents expected behavior
- Forces you to think about edge cases

**Even for "obvious" bugs:**
```javascript
// Bug: Button doesn't disable during loading

// Test BEFORE fix:
it('should disable button during loading', () => {
  render(<MyComponent />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toBeDisabled();  // ❌ FAILS
});

// Fix the code

// Test AFTER fix:
// ✅ PASSES
```

### Multi-File Bugs

Some bugs span multiple files:

**Example:**
- Service function returns wrong data format
- Component expects different format
- UI breaks

**Fix strategy:**
1. Identify all affected files (Claude can help)
2. Write tests for each file
3. Fix from bottom up (service → component → UI)
4. Verify each layer independently

### When to Create GitHub Issue

**Always create for:**
- User-reported bugs
- Bugs found in production
- Bugs that affect multiple users
- Bugs that took >1 hour to fix (document learnings!)

**Optional for:**
- Typos fixed in 2 minutes
- Console warnings that don't affect functionality
- Bugs found and fixed immediately during development

**Rule of thumb:** If you'll forget about it tomorrow, create an issue!

---

## 🚫 Common Mistakes

### Mistake #1: Skipping Bug Report
**Why it's tempting:** "I know what's wrong, let me just fix it!"

**Why it's wrong:** You'll forget details, can't track it, others can't learn from it

**Fix:** Always create bug report, even for "quick fixes"

### Mistake #2: Fixing Without Understanding Root Cause
**What happens:** Fix the symptom, bug comes back differently

**Example:**
- Bug: Link doesn't generate
- Bad fix: Add fallback value (treats symptom)
- Good fix: Figure out why generation fails (treats cause)

**Fix:** Always ask "why" until you reach the root cause

### Mistake #3: Not Writing Failing Test
**Why it's tempting:** "I already reproduced it manually"

**Why it's wrong:** Manual tests don't prevent regression

**Fix:** TDD is non-negotiable (see [Testing SOP](SOP_TESTING_APPROACH.md))

### Mistake #4: Committing with Failing Tests
**What happens:** CI/CD fails, blocks everyone, you look bad

**Fix:** Tests must be 100% passing before commit. Period.

### Mistake #5: Changing Unrelated Code
**Why it's tempting:** "While I'm here, let me also refactor..."

**Why it's wrong:** Bug fix PR should ONLY fix the bug

**Fix:** Create separate PR for refactoring, keep bug fix focused

### Mistake #6: Not Manual Testing
**What happens:** Tests pass but UX is still broken

**Fix:** Always manually test the exact reproduction steps

---

## 🎯 Checklist: Before Saying "fixit"

**Gather evidence:**
- [ ] Can you consistently reproduce the bug?
- [ ] Do you know the exact steps to trigger it?
- [ ] Have you checked browser console for errors?
- [ ] Have you checked Firestore for data issues?
- [ ] Do you know when it started breaking?

**If you answered "no" to most:**
Investigate more before starting "fixit" workflow.

**If you answered "yes" to most:**
Perfect! You have good information for Claude.

---

## 🎯 Checklist: Before Marking Bug Fixed

**Testing:**
- [ ] Failing test now passes
- [ ] All tests in test suite passing (100%)
- [ ] ESLint clean
- [ ] Manual testing: exact reproduction steps work
- [ ] Manual testing: edge cases checked
- [ ] No regressions (didn't break other features)

**Documentation:**
- [ ] Bug report updated with solution
- [ ] GitHub issue linked in commit
- [ ] Commit message describes root cause and fix
- [ ] Code comments explain "why" (if not obvious)

**Version Control:**
- [ ] Branch follows naming convention (bug/XX-description)
- [ ] Commits are focused (only bug fix, no extras)
- [ ] PR created with descriptive title
- [ ] PR references GitHub issue

---

## 📚 Related Documentation

- **Next:** [Git Conventions SOP](SOP_GIT_WORKFLOW.md) - proper commit messages
- **Quality:** [Testing Philosophy SOP](SOP_TESTING_APPROACH.md) - why tests matter
- **Features:** [PRD Workflow SOP](SOP_PRD_WORKFLOW.md) - building new things
- **Overview:** [AI Development Guide](../AI_DEVELOPMENT_GUIDE.md) - the big picture

---

## 🔍 Debugging Cheat Sheet

Quick reference for common issues:

| Symptom | Likely Cause | First Thing to Check |
|---------|-------------|---------------------|
| Infinite loading | Missing await | Check async functions have await |
| "Cannot read property X of undefined" | Missing null check | Add `if (!obj) return;` |
| Data not saving | Security rules | Check Firestore rules allow write |
| Component not re-rendering | State not updated | Check setState is called |
| Wrong data displayed | Stale data | Check useEffect dependencies |
| Error after dependency update | Breaking change | Check package changelog |
| Works locally, fails in production | Environment variable | Check .env files |
| Random failures | Race condition | Check async timing |

---

## 📖 Example Bug Report Template

```markdown
# Bug Report: [Short Description]

**Date:** YYYY-MM-DD
**GitHub Issue:** #XX
**Reporter:** Your Name
**Severity:** High | Medium | Low
**Status:** In Progress
**Branch:** bug/XX-description

---

## Description

[One paragraph explaining what's broken]

---

## Expected Behavior

[What should happen, step by step]

---

## Actual Behavior

[What actually happens, step by step]

---

## Steps to Reproduce

1. [First step]
2. [Second step]
3. [Third step]
4. Observe: [What happens]

**Reproducibility:** Always | Sometimes | Rare

---

## Root Cause Analysis

**Root Cause:**
[Technical explanation of WHY it's broken]

**In [filename] (lines X-Y):**
```[language]
[Code showing the problem]
```

**Why this causes the bug:**
[Explanation]

---

## Fix Plan

**Solution:**
[How we'll fix it]

**Files to modify:**
- `path/to/file1.js` - [What will change]
- `path/to/file2.js` - [What will change]

---

## Solution

[Filled in after fix]

### What was changed:

**Before:**
```[language]
[Old code]
```

**After:**
```[language]
[New code]
```

### Files Modified:
- ✅ `path/to/file.js`

### Testing:
- ✅ All XXX tests passing
- ✅ ESLint clean
- ✅ Manual testing successful

---

## Timeline

- **Reported:** YYYY-MM-DD
- **Started:** YYYY-MM-DD
- **Fixed:** YYYY-MM-DD
- **Verified:** YYYY-MM-DD

---

## Notes

[Any additional context, lessons learned, etc.]
```

---

**Last Updated:** 2025-10-24

**See Also:**
- Real bug reports in `bugs/` folder
- GitHub issues: https://github.com/fletchux/lonch/issues

**Questions?** Ask in team chat or open an issue.
