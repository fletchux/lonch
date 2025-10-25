# SOP: PRD-Driven Feature Development

**Purpose:** Build new features systematically using Product Requirements Documents and AI-generated task lists.

**When to use:** Any non-trivial feature that requires multiple files, components, or services.

**Time:** Initial PRD: 15-30 min | Task generation: 5 min | Implementation: varies by complexity

---

## 📋 TL;DR

```bash
1. Say to Claude: "I want to build [feature description]"
2. Claude will guide you through creating a PRD
3. Generate tasks from the PRD
4. Process tasks one-by-one with Claude
5. All tests passing? Feature complete! 🎉
```

---

## 🎯 When to Use This Workflow

### ✅ Use PRD workflow when:
- Building a new feature (e.g., shareable invite links, email notifications)
- Adding a new page or major UI component
- Implementing a new service or integration
- Changes affect multiple files/components
- Feature needs clear requirements

### ❌ Don't use PRD workflow when:
- Fixing bugs (use [Bug Fixing SOP](SOP_BUG_FIXING.md) instead)
- Minor UI tweaks (just ask Claude conversationally)
- Refactoring existing code without behavior changes
- Adding a single simple function

**Rule of thumb:** If you'd write requirements for it in a traditional setting, use PRD workflow.

---

## 🚀 Step-by-Step Guide

### Step 1: Initiate PRD Creation

**Option A: Use the workflow (recommended)**
```bash
# In your Claude Code session
[Tell Claude about your feature idea]
```

Claude will ask you questions like:
- What is the main goal of this feature?
- Who is the target user?
- What are the key user flows?
- Are there any technical constraints?

**Option B: Start with existing PRD (if you have written requirements)**
- Place your PRD in `specs/[number]-prd-[feature-name].md`
- Follow the format in existing PRDs (see example below)

**📚 Junior Dev Note:**
A PRD is like a blueprint for building a house. You wouldn't start construction without plans, right? Same here - the PRD ensures everyone (including Claude) understands what to build.

### Step 2: Review and Refine the PRD

Claude will generate a PRD document. Review it for:

**✅ Checklist:**
- [ ] Clear user stories ("As a [user], I want to [action] so that [benefit]")
- [ ] Specific acceptance criteria (how do we know it's done?)
- [ ] Technical approach outlined
- [ ] Dependencies identified
- [ ] Edge cases considered
- [ ] Security/permissions implications noted

**Common issues to watch for:**
- ❌ Vague requirements: "Make it user-friendly"
- ✅ Specific requirements: "Show error message if email is invalid"

- ❌ Missing edge cases: "Allow file upload"
- ✅ Includes edge cases: "Allow file upload (max 10MB, PDF/DOCX only, show progress)"

**Pro tip:** Ask Claude questions about the PRD:
```
"What happens if the user uploads a file while offline?"
"How does this interact with the permissions system?"
"What if two users generate links at the same time?"
```

### Step 3: Generate Task List

Once PRD is approved, generate tasks:

**Say to Claude:**
```
"Generate tasks from this PRD"
```

Claude will create a task list in `specs/tasks-[number]-prd-[feature-name].md`

**Task list structure:**
```markdown
## Task 1: Create service function for invite link generation
**Status:** pending
**Files:** src/services/inviteLinkService.js
**Description:** Implement generateInviteLink() function...
**Acceptance:** Function creates link in Firestore with correct fields

## Task 2: Build UI modal component
**Status:** pending
**Files:** src/components/project/GenerateLinkModal.jsx
...
```

**Review the task order:**
- Tasks should build logically (services before UI, etc.)
- Dependencies should be clear
- Each task should be completable independently

**📚 Junior Dev Note:**
Think of tasks like levels in a video game - complete them in order, each one builds on the previous. Don't skip ahead!

### Step 4: Process Tasks One-by-One

**Say to Claude:**
```
"Let's start with Task 1"
```

For each task, Claude will:
1. **Read** relevant existing code
2. **Plan** the implementation approach
3. **Write tests** first (if applicable)
4. **Implement** the code
5. **Verify** tests pass
6. **Update** task status to "completed"

**Your job during each task:**
- Review code changes (don't just blindly accept)
- Ask questions if something is unclear
- Test manually if it's a UI change
- Approve or request changes

**Example interaction:**
```
You: "Let's do Task 1"

Claude: "I'll implement the generateInviteLink service function.
         First, let me read the existing inviteLinkService.js...

         [Claude reads file]

         I'll write a test first. Here's what I'm testing:
         - Creates document in inviteLinks collection
         - Sets correct role and group
         - Generates unique token
         - Returns link object with URL

         [Claude writes test]

         Test is failing (expected). Now implementing the function...

         [Claude implements]

         Running tests... ✅ All 42 tests passing!

         Task 1 complete. Ready for Task 2?"

You: [Review the code changes]
     "Looks good! Let's do Task 2"
```

**⚠️ Important: Never skip test verification!**
After each task, you should see:
```
✅ All XXX tests passing
✅ ESLint clean
```

If not, **stop and fix** before moving to next task.

### Step 5: Manual Testing After All Tasks

Once all tasks are marked "completed":

1. **Run the full test suite:**
```bash
npm test
```

2. **Run ESLint:**
```bash
npx eslint .
```

3. **Build the app:**
```bash
npm run build
```

4. **Manual testing:**
   - Follow the user flows described in the PRD
   - Test edge cases mentioned in acceptance criteria
   - Try to break it (boundary conditions, errors, etc.)

**Create a manual testing checklist:**
```markdown
Feature: Shareable Invite Links

- [ ] Generate link with each role (owner, admin, editor, viewer)
- [ ] Generate link for each group (consulting, client)
- [ ] Copy link to clipboard works
- [ ] Link shows in Share Links table
- [ ] Accept link while logged out → redirects to login
- [ ] Accept link while logged in → joins project
- [ ] Project appears in dashboard after acceptance
- [ ] Activity log records link creation
- [ ] Activity log records link acceptance
- [ ] Can revoke a link
- [ ] Revoked link shows error when accessed
- [ ] Link expires after 7 days
```

**📚 Junior Dev Note:**
Tests verify code works. Manual testing verifies the **experience** works. Both are essential!

### Step 6: Update Documentation

**Required:**
- [ ] Update PRD with "Implementation Notes" section
- [ ] Add feature to `FEATURE_COMPLETE.md` (if it's a major feature)
- [ ] Update README if feature requires new setup steps

**Optional but encouraged:**
- [ ] Screenshots of new UI (add to PRD or docs/)
- [ ] Update architecture docs if structure changed
- [ ] Create user guide if feature is complex

### Step 7: Commit and Create PR

Follow [Git Conventions SOP](SOP_GIT_WORKFLOW.md) for commit message format.

**Example commit:**
```bash
git add -A
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

Closes #XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## 📖 Real Example: Share Links Feature

Let's walk through an actual feature we built:

### Context
**User need:** Project owners want to invite external users without manually adding them.

**PRD Created:** `specs/0004-prd-shareable-invite-links.md`

### The Process

**1. PRD Creation (20 minutes)**
- Discussed requirements with Claude
- Identified user stories
- Defined acceptance criteria
- Outlined technical approach
- Reviewed and approved

**2. Task Generation (5 minutes)**
```
Generated 8 tasks:
1. Create inviteLinkService with generation function
2. Add Firestore security rules for inviteLinks collection
3. Create GenerateLinkModal component
4. Add ShareLinksTab to Members page
5. Implement AcceptInviteLinkPage
6. Add email notification integration
7. Update activity logging
8. Add comprehensive tests
```

**3. Task Processing (4 hours)**
Each task followed TDD:
- Write failing test
- Implement feature
- Tests pass
- Move to next task

**4. Manual Testing (30 minutes)**
- Tested all user flows
- Found 4 bugs (modal closing, loading state, etc.)
- Fixed bugs using bug workflow
- Retested - all working

**5. Results:**
- ✅ 648 tests passing (was 612 before)
- ✅ Feature fully functional
- ✅ Zero regressions
- ✅ Well documented

**Time:** ~5 hours total vs. estimated 8-10 hours traditional development

**Quality:** Higher (comprehensive tests, clear docs, no technical debt)

---

## 💡 Tips & Tricks

### Writing Better PRDs

**DO:**
- ✅ Use concrete examples: "User clicks 'Generate Link', sees modal with role dropdown"
- ✅ Define success metrics: "Link generation completes in <2 seconds"
- ✅ Consider error states: "If Firestore is down, show retry button"
- ✅ Include mockups or sketches (even hand-drawn!)
- ✅ Reference existing patterns: "Similar to how document upload works"

**DON'T:**
- ❌ Be vague: "Make sharing easy"
- ❌ Over-specify implementation: "Use React.useState on line 42"
- ❌ Ignore edge cases: Only describe happy path
- ❌ Skip acceptance criteria: How do we know it's done?

### Managing Long Task Lists

**If you have 10+ tasks:**
1. Group related tasks into phases
2. Complete one phase before starting next
3. Commit after each phase (not just at the end)
4. Take breaks between phases

**Example phases:**
```
Phase 1: Backend/Services (Tasks 1-3)
Phase 2: UI Components (Tasks 4-6)
Phase 3: Integration (Tasks 7-8)
Phase 4: Testing & Polish (Tasks 9-12)
```

### When Tasks Go Wrong

**Problem:** Task seems too big
**Solution:** Ask Claude to break it into subtasks

**Problem:** Unclear what task is asking
**Solution:** Ask Claude to clarify or provide example

**Problem:** Task causes test failures
**Solution:** Stop, fix tests, then continue (never skip!)

**Problem:** Task requires changes not in PRD
**Solution:** Update PRD, regenerate tasks if needed

### Parallel Development

**Can multiple devs work on same PRD?**
Yes! Coordinate on task assignment:
```
Developer A: Tasks 1-4 (backend/services)
Developer B: Tasks 5-8 (UI components)
```

**Tips for parallel work:**
- Commit services before UI depends on them
- Use feature branch: `feature/shareable-links`
- Communicate about shared files
- Merge frequently to avoid conflicts

---

## 🚫 Common Mistakes

### Mistake #1: Skipping PRD Review
**What happens:** Tasks are generated from vague requirements, implementation is wrong

**Fix:** Always review and refine PRD before generating tasks

### Mistake #2: Doing Multiple Tasks at Once
**What happens:** Changes get tangled, hard to debug, tests fail mysteriously

**Fix:** One task at a time, commit after each (or after logical groups)

### Mistake #3: Not Reading Task Descriptions
**What happens:** You approve code that doesn't meet acceptance criteria

**Fix:** Read "Description" and "Acceptance" sections before reviewing code

### Mistake #4: Skipping Manual Testing
**What happens:** Tests pass but UX is broken, users find bugs

**Fix:** Manual testing checklist is not optional (see Step 5)

### Mistake #5: Not Updating PRD After Changes
**What happens:** Documentation diverges from reality, confusion later

**Fix:** Add "Implementation Notes" section with any deviations

---

## 🎯 Checklist: Ready to Start?

Before beginning any PRD-driven feature:

**Prerequisites:**
- [ ] Feature idea is clear (you can explain it in 2-3 sentences)
- [ ] Main branch is clean (no uncommitted changes)
- [ ] All existing tests passing
- [ ] You have time to complete at least a few tasks

**During Development:**
- [ ] PRD reviewed and approved
- [ ] Tasks generated and ordered logically
- [ ] Processing tasks one-by-one
- [ ] Tests passing after each task
- [ ] Committing regularly

**Before Marking Complete:**
- [ ] All tasks completed
- [ ] All tests passing (100%)
- [ ] ESLint clean
- [ ] Manual testing checklist completed
- [ ] Documentation updated
- [ ] PR created with descriptive commit message

---

## 📚 Related Documentation

- **Next Steps:** [Bug Fixing SOP](SOP_BUG_FIXING.md) - fixing issues found during manual testing
- **Quality:** [Testing Philosophy SOP](SOP_TESTING_APPROACH.md) - our testing standards
- **Version Control:** [Git Conventions SOP](SOP_GIT_WORKFLOW.md) - committing your work
- **Overview:** [AI Development Guide](../AI_DEVELOPMENT_GUIDE.md) - understanding the big picture

---

## 📁 Example PRD Structure

Here's a template you can copy:

```markdown
# PRD-XXXX: [Feature Name]

**Status:** Draft | In Progress | Completed
**Priority:** High | Medium | Low
**Target:** [Version or date]
**Owner:** [Your name]

---

## Overview

### Problem Statement
[What problem does this solve? Why do users need this?]

### Proposed Solution
[High-level description of the feature]

### Success Metrics
- [How do we measure if this is successful?]

---

## User Stories

### Story 1: [User Action]
**As a** [user role]
**I want to** [action]
**So that** [benefit]

**Acceptance Criteria:**
- [ ] [Specific, testable criterion]
- [ ] [Another criterion]

---

## Technical Design

### Architecture
[Diagram or description of components]

### Data Model
[Firestore collections, fields, types]

### API / Services
[Functions to be created or modified]

### UI Components
[Components to be created or modified]

---

## Edge Cases & Error Handling

- **Edge Case 1:** [Description] → [How to handle]
- **Edge Case 2:** [Description] → [How to handle]

---

## Security & Permissions

- **Who can access:** [Role requirements]
- **Data visibility:** [Group constraints]
- **Firestore rules:** [Security rules needed]

---

## Dependencies

- **Technical:** [Required libraries, APIs, etc.]
- **Features:** [Other features this depends on]
- **External:** [Third-party services, etc.]

---

## Testing Strategy

### Unit Tests
- [Service function tests]
- [Component rendering tests]

### Integration Tests
- [User flow tests]
- [Service integration tests]

### Manual Testing
- [ ] [Manual test case 1]
- [ ] [Manual test case 2]

---

## Implementation Notes

[Added after implementation - any deviations from plan, lessons learned, etc.]

---

## Open Questions

- [ ] [Question to be answered before implementation]
```

---

**Last Updated:** 2025-10-24

**See Also:**
- Example PRD: `specs/0004-prd-shareable-invite-links.md`
- Example Tasks: `specs/tasks-0004-prd-shareable-invite-links.md`

**Questions?** Ask in team chat or open an issue.
