# Bug Report: Generate Link Modal Closes Before Showing Link

**Date:** 2025-10-24
**GitHub Issue:** #13
**Reporter:** User (cfletcher)
**Severity:** High
**Status:** Fixed
**Branch:** `bug/13-generate-link-modal-closes-immediately`

---

## Description

When generating a shareable invite link, the modal closes immediately after clicking "Generate Link" button, preventing the user from seeing or copying the generated link.

---

## Location

- **Page/View:** Project Dashboard → Members Tab → Share Links Sub-tab
- **Component:** GenerateLinkModal (src/components/project/GenerateLinkModal.jsx)
- **Parent Component:** ShareLinksTab (src/components/project/ShareLinksTab.jsx)
- **Feature Area:** Collaboration / Shareable Invite Links

---

## Expected Behavior

When user clicks "Generate Link":
1. Show "Generating..." button state
2. Generate the invite link in Firestore
3. **Modal switches to show the generated link screen with:**
   - The full shareable URL in a text input
   - "Copy" button to copy link to clipboard
   - Link details (role, group, expiration date)
   - Single-use and expiration warnings
4. User can copy the link
5. User clicks "Done" button
6. Modal closes and refreshes the links list

---

## Actual Behavior

When user clicks "Generate Link":
1. Button shows "Generating..." briefly
2. Link is created in Firestore (confirmed by activity log)
3. **Modal immediately closes** ❌
4. User never sees the generated link
5. Links list refreshes showing the new link in the table
6. User has no way to get the shareable URL to give to recipients

**Result:** Feature is broken - users cannot share the links they generate.

---

## Steps to Reproduce

1. Navigate to Project → Members → Share Links
2. Click "+ Generate Link" button
3. Select role (e.g., "Viewer")
4. Select group (e.g., "Client Group")
5. Click "Generate Link" button
6. Observe: Modal closes immediately
7. Check links table: New link appears (confirming it was created)
8. Problem: User never saw the URL and cannot share it

**Reproducibility:** Always (100%)

---

## Technical Details

### Root Cause Analysis

**Root Cause:**
The `onLinkGenerated` callback is being called immediately when the link is generated, which closes the modal before the UI can display the link.

**In ShareLinksTab.jsx (lines 79-82):**
```javascript
function handleLinkGenerated() {
  setShowGenerateModal(false);  // ❌ Closes modal immediately
  fetchLinks();
}
```

**In ShareLinksTab.jsx (line 249):**
```javascript
<GenerateLinkModal
  projectId={projectId}
  onClose={() => setShowGenerateModal(false)}
  onLinkGenerated={handleLinkGenerated}  // ❌ Callback passed to modal
/>
```

**In GenerateLinkModal.jsx (lines 41-45):**
```javascript
setGeneratedLink(link);

if (onLinkGenerated) {
  onLinkGenerated(link);  // ❌ Fires immediately, closes parent modal
}
```

**The Problem:**
The modal architecture has two states:
1. **Form state** (!generatedLink): Shows role/group selection
2. **Success state** (generatedLink): Shows the generated link

However, `onLinkGenerated` callback fires when transitioning from state 1 → state 2, which triggers the parent to close the modal before the user ever sees state 2.

**Why it wasn't caught:**
- [x] Manual testing during development didn't verify the full user flow
- [ ] Missing integration test for complete link generation flow
- [x] Modal state management design flaw

### Related Files
- `src/components/project/ShareLinksTab.jsx` - Parent component with callback
- `src/components/project/GenerateLinkModal.jsx` - Modal component

---

## Fix Plan

### Test-Driven Development Approach

- [ ] 1. Write failing test that reproduces the bug
- [ ] 2. Verify test fails (proves bug is captured)
- [ ] 3. Implement fix
- [ ] 4. Verify test passes
- [ ] 5. Run full test suite (check for regressions)
- [ ] 6. Manual verification
- [ ] 7. Update this report with solution

### Solution Options

**Option A: Don't call onLinkGenerated until "Done" is clicked**

Remove the callback from line 43-45 in GenerateLinkModal.jsx, and instead:
- Call it when user clicks "Done" button (line 258-263)
- This way modal stays open showing the link, then closes and refreshes when user is done

**Option B: Change onLinkGenerated to not close modal**

Keep the callback but change it to only refresh links without closing:
```javascript
function handleLinkGenerated() {
  // Don't close modal here - let user click Done
  fetchLinks();
}
```

And rely on the "Done" button's onClick to call `onClose`.

**Recommended:** Option A (cleaner separation of concerns)

### Files to Modify
- `src/components/project/GenerateLinkModal.jsx` - Move onLinkGenerated call
- `src/components/project/GenerateLinkModal.test.jsx` - Add integration test

---

## Additional Issue: Activity Log Message

**Secondary Issue:**
The activity log message says:
> "Fletch created an invite link for owner in the consulting group"

**Should say:**
> "Fletch created an invite link that will allow someone to join as an owner in the consulting group"

OR simpler:
> "Fletch created an invite link (Owner, Consulting Group)"

**File:** `src/services/inviteLinkService.js` (lines 94-106)

---

## Solution

### What was changed:

**Fix 1: Modal callback timing**

Moved the `onLinkGenerated()` callback from happening during link generation to happening when user clicks "Done" button.

**Before** (GenerateLinkModal.jsx lines 41-45):
```javascript
setGeneratedLink(link);

if (onLinkGenerated) {
  onLinkGenerated(link);  // ❌ Fires immediately, closes modal
}
```

**After** (GenerateLinkModal.jsx lines 41-57):
```javascript
setGeneratedLink(link);
// Don't call onLinkGenerated here - let user see and copy the link first

// ... later, new handleDone function:

function handleDone() {
  // Call onLinkGenerated when user clicks Done (to refresh the links list)
  if (onLinkGenerated && generatedLink) {
    onLinkGenerated(generatedLink);
  }
  onClose();
}
```

And updated the "Done" button to call `handleDone()` instead of `onClose()` directly.

**Fix 2: Activity log message**

Changed the activity log wording to be clearer.

**Before** (ActivityLogPanel.jsx line 183):
```javascript
return `${userName} created an invite link for ${role} in ${group}`;
```

**After** (ActivityLogPanel.jsx line 183):
```javascript
return `${userName} created an invite link that will allow someone to join as ${role} in ${group}`;
```

### Files Modified:
- ✅ `src/components/project/GenerateLinkModal.jsx` - Moved callback timing, added handleDone()
- ✅ `src/components/project/GenerateLinkModal.test.jsx` - Added test for correct callback timing
- ✅ `src/components/project/ActivityLogPanel.jsx` - Improved activity log message

### Testing:
- ✅ Added failing test that reproduces the bug
- ✅ Test now passes after fix
- ✅ All 648 tests passing (2 new tests added)
- ✅ ESLint clean
- ✅ Build successful (967KB bundle)
- ⏳ Manual verification pending

---

## Prevention

**How can we prevent similar bugs in the future?**

- [ ] Add integration tests that verify complete user flows, not just unit functionality
- [ ] Manual testing checklist: "Can user see and copy the generated output?"
- [ ] Code review: Check callback timing and modal state management
- [x] Document expected user flow in component comments

---

## Related Issues

- Part of: PRD-0004 (Shareable Invite Links)
- Blocks: Full functionality of share links feature

---

## Timeline

- **Reported:** 2025-10-24 (during manual testing after fixing #11 and #12)
- **Started:** [TBD]
- **Fixed:** [TBD]
- **Verified:** [TBD]
- **Deployed:** [TBD]

---

## Notes

This is the third bug discovered in the Share Links feature:
1. ✅ Bug #11 - Loading state stuck (fixed)
2. ✅ Bug #12 - Missing Firestore indexes (fixed)
3. ⏳ Bug #13 - Modal closes before showing link (this bug)

All three bugs were discovered through progressive manual testing. The feature tests all pass but don't cover the complete end-to-end user experience.

---

*Generated using the `fixit` workflow*
