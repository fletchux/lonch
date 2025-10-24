# Bug Report: Missing Firestore Indexes for Invite Links

**Date:** 2025-10-24
**GitHub Issue:** #12
**Reporter:** User (cfletcher)
**Severity:** High
**Status:** In Progress
**Branch:** `bug/12-missing-firestore-indexes-invite-links`

---

## Description

When accessing the Share Links tab, the application throws a Firestore error stating "The query requires an index" and provides a link to create the missing composite index in Firebase Console.

---

## Location

- **Page/View:** Project Dashboard → Members Tab → Share Links Sub-tab
- **Component:** ShareLinksTab (src/components/project/ShareLinksTab.jsx)
- **Service:** inviteLinkService.js → getProjectInviteLinks()
- **Feature Area:** Collaboration / Shareable Invite Links

---

## Expected Behavior

When clicking on the Share Links sub-tab:
1. Should load all invite links for the project
2. Display links in a table sorted by creation date (newest first)
3. No database errors

---

## Actual Behavior

Firestore throws an error:
```
Error: Failed to get project invite links: The query requires an index.
You can create it here: https://console.firebase.google.com/v1/r/project/lonch-cb672/firestore/indexes?create_composite=...
```

The Share Links interface fails to load due to missing database indexes.

---

## Steps to Reproduce

1. Log in to the application
2. Navigate to any project
3. Click on "Members" tab
4. Click on "Share Links" sub-tab
5. Observe: Firestore index error in console

**Reproducibility:** Always (100%)

---

## Technical Details

### Error Messages
```
Error: Failed to get project invite links: The query requires an index.
```

### Root Cause Analysis

**Root Cause:**
Missing Firestore composite indexes for the `inviteLinks` collection.

**Technical explanation:**

In `src/services/inviteLinkService.js` (lines 167-171):

```javascript
// Owner and Admin can see all links
q = query(
  linksRef,
  where('projectId', '==', projectId),
  orderBy('createdAt', 'desc')
);
```

And for non-admin users (lines 173-178):
```javascript
// Others only see their own
q = query(
  linksRef,
  where('projectId', '==', projectId),
  where('createdBy', '==', userId),
  orderBy('createdAt', 'desc')
);
```

**The Problem:**
Firestore requires composite indexes when:
1. Combining `where()` with `orderBy()` on different fields
2. Using multiple `where()` clauses with `orderBy()`

**Missing Indexes:**
1. **Index 1:** `projectId` (ASC) + `createdAt` (DESC) - for owner/admin query
2. **Index 2:** `projectId` (ASC) + `createdBy` (ASC) + `createdAt` (DESC) - for regular users

**Why it wasn't caught:**
- [x] Missing index definitions in `firestore.indexes.json`
- [x] Indexes not deployed to Firebase
- [ ] Not tested with real Firebase instance during development
- [x] Similar queries for activityLogs have indexes, but inviteLinks were overlooked

### Environment
- **Database:** Firebase Firestore
- **Project:** lonch-cb672
- **Collection:** `inviteLinks`

### Related Files
- `firestore.indexes.json` - Missing index definitions
- `src/services/inviteLinkService.js` - Queries that require indexes

---

## Fix Plan

### Steps to Fix

- [ ] 1. Add missing index definitions to `firestore.indexes.json`
- [ ] 2. Deploy indexes to Firebase: `firebase deploy --only firestore:indexes`
- [ ] 3. Wait for indexes to build (can take a few minutes)
- [ ] 4. Test manually in browser
- [ ] 5. Update bug report with results

### Required Indexes

**Index 1 - Owner/Admin Query:**
```json
{
  "collectionGroup": "inviteLinks",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "projectId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

**Index 2 - Regular User Query:**
```json
{
  "collectionGroup": "inviteLinks",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "projectId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdBy",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

---

## Solution

[To be filled in after fix is implemented]

### What was changed:
[TBD]

### Files modified:
- `firestore.indexes.json` - Added two composite indexes for inviteLinks collection

### Deployment:
- [TBD] Deploy indexes to Firebase
- [TBD] Wait for index build completion

### Verification:
- [ ] Manual testing complete
- [ ] Share Links loads successfully
- [ ] Can see invite links in table
- [ ] Can generate new links
- [ ] Can revoke links

---

## Prevention

**How can we prevent similar bugs in the future?**

- [ ] Add checklist to PRD workflow: "Does this feature need Firestore indexes?"
- [ ] Document all Firestore queries during implementation
- [ ] Test with real Firebase instance (not just mocks) before marking feature complete
- [ ] Add comment in firestore.indexes.json with link to query that uses each index
- [x] Review all collection queries for missing indexes

---

## Related Issues

- Related to: #11 (Share Links loading issue - partially fixed)
- Blocks: Full functionality of PRD-0004 (Shareable Invite Links)

---

## Timeline

- **Reported:** 2025-10-24 (during manual testing of fix for #11)
- **Started:** [TBD]
- **Fixed:** [TBD]
- **Verified:** [TBD]
- **Deployed:** [TBD]

---

## Notes

This bug was discovered during manual verification of the fix for issue #11 (loading state bug). The loading state bug was successfully fixed, but then this database index error was revealed.

**Lesson learned:** Always test features with real Firebase instance, not just mocked data. Unit tests don't catch missing Firestore indexes.

---

*Generated using the `fixit` workflow*
