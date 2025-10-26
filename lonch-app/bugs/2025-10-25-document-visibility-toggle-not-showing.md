# Bug Report: Document Visibility Toggle Not Showing/Working

**Date:** 2025-10-25
**Reporter:** cfletcher
**Severity:** Medium
**Status:** ✅ Resolved
**Resolution Date:** 2025-10-26
**Component:** DocumentList, DocumentVisibilityToggle
**Affected Users:** Project owners who should be able to set document visibility

---

## 📋 Summary

The document visibility toggle that allows users to set whether documents are visible to "Consulting Only", "Client Only", or "Both Groups" is not appearing or not working in the Overview tab's Project Documents section. This feature worked in previous versions but is now missing/non-functional.

---

## 🔍 Bug Details

### What's Broken
- Document visibility toggle controls are not visible/accessible in the Project Documents table
- User cannot change which group can see specific documents

### Expected Behavior
- As a project owner, I should see a dropdown in the "Visibility" column for each document
- The dropdown should allow me to select:
  - 🔒 Consulting Only
  - 🔒 Client Only
  - 🌐 Both Groups
- At minimum, I should be able to see the current visibility status of each document

### Actual Behavior
- The visibility toggle is "gone" (not visible or not functional)
- Cannot adjust document visibility settings

### Location
- **Page:** Project Dashboard
- **Tab:** Overview
- **Section:** Project Documents card (bottom of Overview tab)
- **Component:** `src/components/documents/DocumentList.jsx` (lines 349-354)

---

## 🔬 Root Cause Analysis

### Investigation Findings

**Code Review:**
The `DocumentVisibilityToggle` component IS present in the code at `DocumentList.jsx:349-354`:

```jsx
<DocumentVisibilityToggle
  visibility={doc.visibility || VISIBILITY.BOTH}
  onChange={(newVisibility) => handleVisibilityChange(doc.id, newVisibility)}
  disabled={!permissions.canSetDocumentVisibility()}
  size="sm"
/>
```

**Permission Logic:**
The toggle is controlled by `permissions.canSetDocumentVisibility()` which checks:

From `src/utils/groupPermissions.js:57-62`:
```javascript
export function canSetDocumentVisibility(userRole, userGroup) {
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';
  const isConsultingGroup = userGroup === GROUP.CONSULTING;

  return isOwnerOrAdmin && isConsultingGroup;
}
```

**Possible Root Causes:**

1. **Missing Group Assignment** (MOST LIKELY)
   - User's `group` field in `projectMembers` collection might not be set
   - This would cause `permissions.canSetDocumentVisibility()` to return `false`
   - Result: Toggle renders but is disabled/grayed out

2. **Group Set to "Client" Instead of "Consulting"**
   - If owner is accidentally in the "client" group, they can't set visibility
   - Only consulting group members can control document visibility

3. **Role/Permission Not Loading**
   - `useProjectPermissions` hook might be failing to load user's role/group
   - Result: `role` or `group` is `null`, failing the permission check

4. **Component Rendering Issue**
   - The toggle might be rendering but CSS/styling issue makes it invisible
   - Less likely given code review

---

## 🧪 Reproduction Steps

1. Log in as project owner
2. Navigate to a project
3. Go to Overview tab
4. Scroll to "Project Documents" section
5. Look at the "Visibility" column in the documents table
6. **Expected:** See a dropdown showing current visibility and allowing changes
7. **Actual:** Toggle is missing or disabled

---

## 💾 Technical Details

### Affected Files
- `src/components/documents/DocumentList.jsx` (lines 349-354)
- `src/components/project/DocumentVisibilityToggle.jsx`
- `src/hooks/useProjectPermissions.js` (lines 85-86)
- `src/utils/groupPermissions.js` (lines 57-62)

### Permission Flow
```
1. DocumentList renders
2. useProjectPermissions(projectId) hook called
3. Hook fetches user's role and group from Firestore
4. permissions.canSetDocumentVisibility() checks:
   - Is role 'owner' or 'admin'? ✓ (user is owner)
   - Is group 'consulting'? ❓ (SUSPECT: might be null or 'client')
5. If false → toggle disabled prop = true
6. DocumentVisibilityToggle renders with disabled=true
7. Select dropdown is grayed out/unclickable
```

### Data Model
User's permissions stored in Firestore:
```javascript
// Collection: projectMembers
// Document: {projectId}_{userId}
{
  projectId: "project123",
  userId: "user456",
  role: "owner",        // ✓ This should be correct
  group: "consulting",  // ❓ This might be missing or incorrect
  addedAt: timestamp,
  addedBy: "user789"
}
```

---

## 🎯 Hypothesis

**Primary Hypothesis:**
The project owner's `group` field in the `projectMembers` subcollection is either:
- Not set (null/undefined)
- Set to "client" instead of "consulting"

This causes `permissions.canSetDocumentVisibility()` to return `false`, which makes the toggle render as disabled.

**Why this is likely:**
- Reporter states they are the owner ("im owner so i should at leasst see the group")
- Feature worked "a few versions ago"
- Recent merges might have affected data migration or member initialization

---

## 🔧 Proposed Solution

### Option 1: Fix User's Group Assignment (Quick Fix)
1. Check current user's group assignment in Firestore
2. If missing or incorrect, update to "consulting"
3. Verify toggle becomes enabled

### Option 2: Default Group Assignment (Long-term Fix)
1. Ensure project owners are ALWAYS assigned to "consulting" group by default
2. Add migration to fix existing owners without group assignment
3. Update project creation logic to set group on owner creation

### Option 3: Improve UX for Disabled State
1. Even if disabled, show current visibility status clearly
2. Add tooltip explaining WHY toggle is disabled
3. Show visual indicator of document group visibility even if can't change it

---

## ✅ Verification Steps

After implementing fix:

1. **Manual Testing:**
   - Log in as project owner
   - Navigate to project Overview → Project Documents
   - Upload a test document
   - Verify visibility dropdown appears and is enabled
   - Change visibility from "Both Groups" to "Consulting Only"
   - Verify change persists (reload page)
   - Check activity log shows visibility change

2. **Automated Testing:**
   - Run existing tests: `npm test`
   - All tests should pass (currently 648 tests)
   - Add new test to verify owner can see and use visibility toggle

3. **Permission Validation:**
   - Verify owner in consulting group CAN set visibility
   - Verify owner in client group CANNOT set visibility (by design)
   - Verify admin in consulting group CAN set visibility
   - Verify editor in consulting group CANNOT set visibility

---

## 📊 Impact Assessment

**Users Affected:**
- Project owners trying to control document visibility
- Anyone who needs to restrict documents to specific groups

**Workaround:**
- None currently - if toggle is disabled, no way to change visibility
- Documents default to "BOTH" visibility if not set

**Urgency:**
- Medium - feature is non-functional but doesn't break core functionality
- High for projects that need confidential consulting-only documents

---

## 📝 Notes

- Feature was working "a few versions ago" - suggests recent change broke it
- Recent merges included bug fixes #11-14, docs additions, and workflow updates
- No direct changes to DocumentVisibilityToggle component in recent commits
- Likely a data issue (missing group assignment) rather than code issue

---

## 🔗 Related

- PRD: Phase 1B - Collaboration & Permissions (65% complete)
- Tasks: 5.4, 5.5, 5.8 - Document visibility controls
- Component: `src/components/project/DocumentVisibilityToggle.jsx`
- Tests: `src/components/project/DocumentVisibilityToggle.test.jsx`

---

---

## ✅ RESOLUTION (2025-10-26)

### Actual Root Cause
The issue was resolved by implementing a **new UI pattern** for document visibility management rather than fixing the individual toggles.

### Solution Implemented
1. **Changed Permission Logic**: Updated `canSetDocumentVisibility()` to allow Owner/Admin from **ANY group** (not just consulting) to set visibility
2. **New Bulk Update UI**: Replaced individual per-row visibility dropdowns with:
   - Visual "Group" chips showing current visibility (🔒 Consulting, 🔒 Client, 🌐 Both)
   - Checkbox selection for multiple documents
   - Bulk visibility dropdown to update multiple documents at once
   - "Update Visibility" button to apply changes
3. **Improved Table**: Reordered columns, renamed "Uploaded By" to "Owner", added responsive design

### Files Changed
- `src/utils/groupPermissions.js` - Updated permission logic
- `src/components/documents/DocumentList.jsx` - Implemented bulk update UI
- `src/components/pages/ProjectDashboard.jsx` - Fixed upload functionality
- `src/App.jsx` - Fixed New Project Setup uploads
- All related tests updated

### Testing
- ✅ All 648 tests passing
- ✅ Manual verification complete
- ✅ Build and linter passing

### Related PRs
- PR #19: Test fixes for new visibility feature

**Status:** Resolved - Feature now working with improved UX
