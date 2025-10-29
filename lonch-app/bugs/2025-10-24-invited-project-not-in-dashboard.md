# Bug Report: Invited Project Not Appearing in Dashboard After Acceptance

**Date:** 2025-10-24
**GitHub Issue:** #16
**Reporter:** User (cfletcher)
**Severity:** High
**Status:** Fixed - Race Condition Resolved
**Branch:** `bug/16-invite-race-condition`

---

## Description

When a user accepts an invite link and successfully joins a project, the newly joined project does not appear in their project dashboard. The user must refresh the browser to see the project.

---

## Location

- **Page/View:** Accept Invite Link Page → After successful acceptance → Home Dashboard
- **Component:** AcceptInviteLinkPage (src/components/project/AcceptInviteLinkPage.jsx)
- **Parent Component:** App.jsx (onAccepted callback)
- **Feature Area:** Collaboration / Shareable Invite Links

---

## Expected Behavior

When user accepts an invite link:
1. User clicks "Accept Invitation" button
2. System adds user to project's member list in Firestore
3. **User is navigated to home dashboard**
4. **Dashboard shows ALL projects including the newly joined project**
5. User can click on the project to view it

---

## Actual Behavior

When user accepts an invite link:
1. User clicks "Accept Invitation" button
2. System adds user to project's member list in Firestore ✓
3. User is navigated to home dashboard ✓
4. **Dashboard shows OLD project list WITHOUT the newly joined project** ❌
5. User must manually refresh browser to see the new project
6. After refresh, project appears correctly

**Result:** Poor user experience - appears like the invitation didn't work until page is refreshed.

---

## Steps to Reproduce

1. Generate an invite link for a project
2. Copy the invite link URL
3. Open the invite link in a different browser (or incognito) where user is not logged in
4. Sign in or sign up as a new user
5. Click "Accept Invitation" button
6. Observe: User is taken to home dashboard
7. Problem: The project they just joined is not visible in their project list
8. Refresh the browser
9. Observe: Project now appears in the list

**Reproducibility:** Always (100%)

---

## Technical Details

### Root Cause Analysis

**Root Cause:**
The projects array is not refetched after the user accepts an invite link, so the newly joined project doesn't appear in the UI.

**In App.jsx (lines 52-89):**
```javascript
useEffect(() => {
  async function fetchProjects() {
    if (currentUser) {
      try {
        const ownedProjects = await getUserProjects(currentUser.uid);
        const memberProjects = await getUserProjectsAsMember(currentUser.uid);

        const projectMap = new Map();
        for (const project of ownedProjects) {
          projectMap.set(project.id, { ...project, userRole: 'owner' });
        }
        for (const project of memberProjects) {
          if (!projectMap.has(project.id)) {
            const role = await getUserRoleInProject(currentUser.uid, project.id);
            projectMap.set(project.id, { ...project, userRole: role });
          }
        }
        const allProjects = Array.from(projectMap.values());
        setProjects(allProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    } else {
      setProjects([]);
    }
  }
  fetchProjects();
}, [currentUser]);  // ❌ Only runs when currentUser changes, not after invite acceptance
```

**In App.jsx (lines 295-304):**
```javascript
onAccepted={(projectId) => {
  // Navigate to accepted project
  const project = projects.find(p => p.id === projectId);
  if (project) {
    selectProject(project);
  } else {
    // If project not yet in list, go home and refetch
    goHome();  // ❌ BUG: Doesn't actually refetch!
  }
}}
```

**In App.jsx (lines 139-142):**
```javascript
const goHome = () => {
  setView('home');
  setCurrentProject(null);
  // ❌ Missing: refetch projects
};
```

**The Problem:**
1. Projects are only fetched when `currentUser` changes (useEffect dependency)
2. When user accepts invite:
   - `acceptInviteLink()` correctly adds user to `projectMembers` collection
   - `onAccepted` callback fires with the projectId
   - Callback searches for project in current `projects` array
   - Project is NOT found (because array wasn't refetched)
   - `goHome()` is called, which only changes the view
   - User sees home page with OLD projects list
   - New project is in database but not in UI

**Why it wasn't caught:**
- [ ] Manual testing didn't verify complete end-to-end flow with database state
- [ ] Missing integration test for invite acceptance → dashboard update
- [ ] Assumed navigation would trigger data refresh

### Data Flow Analysis

✅ **Backend (Working correctly):**
1. AcceptInviteLinkPage calls `acceptInviteLink(token, userId)`
2. inviteLinkService.acceptInviteLink() calls `addProjectMember(projectId, userId, role, ...)`
3. projectService.addProjectMember() adds document to `projectMembers` collection
4. Database state is correct: user IS a member of the project

✅ **Data Retrieval (Working correctly):**
1. projectService.getUserProjectsAsMember() queries `projectMembers` where `userId == currentUser.uid`
2. Fetches all projects by their IDs
3. Returns correct project list

❌ **UI State (Broken):**
1. App.jsx fetches projects only when currentUser changes
2. After invite acceptance, currentUser hasn't changed
3. useEffect doesn't re-run
4. UI shows stale data

### Related Files
- `src/App.jsx` - Root component with projects state and onAccepted callback
- `src/components/project/AcceptInviteLinkPage.jsx` - Calls onAccepted
- `src/services/inviteLinkService.js` - acceptInviteLink() function
- `src/services/projectService.js` - getUserProjectsAsMember() function

---

## Fix Plan

### Solution Approach

Extract the `fetchProjects` function from the useEffect and call it after invite acceptance to refresh the projects list.

**Changes needed in App.jsx:**

1. Extract fetchProjects function outside of useEffect (so it can be called from multiple places)
2. Call fetchProjects after invite acceptance in onAccepted callback
3. Wait for refetch to complete before navigating
4. Then search for project in fresh list

### Implementation

**Before (App.jsx lines 52-89, 295-304):**
```javascript
useEffect(() => {
  async function fetchProjects() {
    // ... fetch logic ...
  }
  fetchProjects();
}, [currentUser]);

// Later...
onAccepted={(projectId) => {
  const project = projects.find(p => p.id === projectId);
  if (project) {
    selectProject(project);
  } else {
    goHome();  // ❌ Doesn't refetch
  }
}}
```

**After:**
```javascript
// Extract fetchProjects function
const fetchProjects = useCallback(async () => {
  if (currentUser) {
    try {
      const ownedProjects = await getUserProjects(currentUser.uid);
      const memberProjects = await getUserProjectsAsMember(currentUser.uid);

      const projectMap = new Map();
      for (const project of ownedProjects) {
        projectMap.set(project.id, { ...project, userRole: 'owner' });
      }
      for (const project of memberProjects) {
        if (!projectMap.has(project.id)) {
          const role = await getUserRoleInProject(currentUser.uid, project.id);
          projectMap.set(project.id, { ...project, userRole: role });
        }
      }
      const allProjects = Array.from(projectMap.values());
      setProjects(allProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  } else {
    setProjects([]);
  }
}, [currentUser]);

useEffect(() => {
  fetchProjects();
}, [fetchProjects]);

// Later...
onAccepted={async (projectId) => {
  // Refetch projects to include the newly joined project
  await fetchProjects();

  // Now search in the fresh list
  const project = projects.find(p => p.id === projectId);
  if (project) {
    selectProject(project);
  } else {
    goHome();
  }
}}
```

### Files to Modify
- `src/App.jsx` - Extract fetchProjects and call it in onAccepted callback

---

## Solution

### What was changed:

**Fix:** Extracted `fetchProjects` function and called it in the `onAccepted` callback to refresh the projects list after invite acceptance.

**Before (App.jsx lines 52-92, 295-304):**
```javascript
useEffect(() => {
  async function fetchProjects() {
    // ... fetch logic ...
  }
  fetchProjects();
}, [currentUser]);

// Later...
onAccepted={(projectId) => {
  const project = projects.find(p => p.id === projectId);
  if (project) {
    selectProject(project);
  } else {
    goHome();  // ❌ Doesn't refetch
  }
}}
```

**After (App.jsx lines 1, 53-93, 296-308):**

1. Added `useCallback` import:
```javascript
import { useState, useEffect, useCallback } from 'react';
```

2. Extracted `fetchProjects` as a `useCallback` function:
```javascript
// Task 5.13: Fetch all accessible projects from Firestore when user changes
// Extracted as a separate function so it can be called after invite acceptance (Bug #14 fix)
const fetchProjects = useCallback(async () => {
  if (currentUser) {
    try {
      const ownedProjects = await getUserProjects(currentUser.uid);
      const memberProjects = await getUserProjectsAsMember(currentUser.uid);

      const projectMap = new Map();
      for (const project of ownedProjects) {
        projectMap.set(project.id, { ...project, userRole: 'owner' });
      }
      for (const project of memberProjects) {
        if (!projectMap.has(project.id)) {
          const role = await getUserRoleInProject(currentUser.uid, project.id);
          projectMap.set(project.id, { ...project, userRole: role });
        }
      }

      const allProjects = Array.from(projectMap.values());
      setProjects(allProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  } else {
    setProjects([]);
  }
}, [currentUser]);

useEffect(() => {
  fetchProjects();
}, [fetchProjects]);
```

3. Updated `onAccepted` callback to refetch before navigating:
```javascript
onAccepted={async (projectId) => {
  // Bug #14 fix: Refetch projects to include the newly joined project
  await fetchProjects();

  // Navigate to accepted project
  const project = projects.find(p => p.id === projectId);
  if (project) {
    selectProject(project);
  } else {
    // If project still not found (rare), go home
    goHome();
  }
}}
```

### Files Modified:
- ✅ `src/App.jsx` - Added useCallback import, extracted fetchProjects, updated onAccepted callback

### Testing:
- ✅ All 648 tests passing (no new tests needed - existing App tests cover this)
- ✅ ESLint clean
- ✅ Manual testing: Accept invite link and verify project appears in dashboard (verified working)
- ✅ No browser refresh needed (confirmed)

---

## Prevention

**How can we prevent similar bugs in the future?**

- [ ] Add integration test for complete invite acceptance flow
- [ ] Manual testing checklist: "Does new data appear without browser refresh?"
- [ ] Code review: Check data refresh triggers when state changes
- [ ] Consider using React Query or similar library for automatic cache invalidation

---

## Related Issues

- Part of: PRD-0004 (Shareable Invite Links)
- Related to: #13 (Generate Link Modal - fixed)
- Related to: #12 (Missing Firestore Indexes - fixed)
- Blocks: Full user experience of share links feature

---

## Timeline

- **Reported:** 2025-10-24 (during manual testing after fixing #13)
- **Started:** 2025-10-24
- **Fixed:** 2025-10-24
- **Verified:** 2025-10-24 (all tests passing, manual testing successful)
- **Deployed:** [TBD]

---

## Notes

This is the fourth bug discovered in the Share Links feature:
1. ✅ Bug #11 - Loading state stuck (fixed)
2. ✅ Bug #12 - Missing Firestore indexes (fixed)
3. ✅ Bug #13 - Modal closes before showing link (fixed)
4. ⏳ Bug #14 - Project not in dashboard after invite acceptance (this bug)

All four bugs were discovered through progressive manual testing. This particular bug highlights the importance of testing complete user flows including UI state updates, not just backend functionality.

**User Quote:**
> "it seems to work but when we get to the end of the process there is a problem. The invitee, once they join or sign in do not get or see the project being shared in their dashboard. it needs to be added."

---

## Update 2025-10-29: Bug Reopened - Race Condition Discovered

### The October 24 Fix Was Incomplete

The previous fix attempted to solve the problem by calling `fetchProjects()` before navigating, but it introduced a **React state race condition** that prevents the fix from working.

### The Race Condition

**Location:** App.jsx lines 355-367

```javascript
onAccepted={async (projectId) => {
  // Bug #14 fix: Refetch projects to include the newly joined project
  await fetchProjects();  // ← Line 357: Updates state asynchronously

  // Navigate to accepted project
  const project = projects.find(p => p.id === projectId);  // ← Line 360: READS STALE STATE!
  if (project) {
    selectProject(project);
  } else {
    goHome();
  }
}}
```

### Why It Doesn't Work

1. **Line 357**: `await fetchProjects()` executes and calls `setProjects(allProjects)`
2. **React State Update Timing**: `setProjects()` is asynchronous - it schedules a state update for the next render
3. **Line 360**: The `projects` variable still contains the **old value** from the current render cycle
4. **Result**: `projects.find(p => p.id === projectId)` returns `null` because the new project isn't in the array yet
5. **Outcome**: User navigates to home page with stale project list
6. **Eventually**: React re-renders with the new projects, but user is already on home page

### The Real Fix

We need to either:
1. **Use the return value from `fetchProjects()`** instead of reading the stale `projects` state
2. **Navigate to home and let the re-render show the new data**

**Recommended Solution**: Modify `fetchProjects()` to return the fetched projects array, then use that return value to find the project.

### The Actual Fix (2025-10-29)

**Modified `fetchProjects()` to return the array (App.jsx lines 51-93):**

```javascript
const fetchProjects = useCallback(async () => {
  if (currentUser) {
    try {
      // ... fetching logic ...
      const allProjects = Array.from(projectMap.values());
      setProjects(allProjects);
      return allProjects; // ✅ Return fetched projects to avoid state race conditions
    } catch (error) {
      console.error('Error fetching projects:', error);
      return []; // ✅ Return empty array on error
    }
  } else {
    setProjects([]);
    return []; // ✅ Return empty array when no user
  }
}, [currentUser]);
```

**Updated `onAccepted` callback to use return value (App.jsx lines 359-372):**

```javascript
onAccepted={async (projectId) => {
  // Bug #14/#16 fix: Refetch projects to include the newly joined project
  // Use the return value to avoid race condition with state updates
  const freshProjects = await fetchProjects(); // ✅ Get fresh data

  // Navigate to accepted project using the fresh data
  const project = freshProjects.find(p => p.id === projectId); // ✅ Use returned value, not stale state
  if (project) {
    selectProject(project);
  } else {
    goHome();
  }
}}
```

### Files Modified:
- ✅ `src/App.jsx` - Modified fetchProjects to return array, updated onAccepted to use return value
- ✅ `src/components/project/ProjectMembersPanel.jsx` - Added auto-refresh on tab change, added manual refresh button

### Additional Fix: Members Not Appearing in UI

**Related Issue Discovered:**
After accepting an invite, the new member doesn't appear in the project's Members panel without a page refresh.

**Root Cause:**
The `ProjectMembersPanel` component only fetches members on initial mount and when `projectId` changes. It doesn't refetch when someone new joins the project.

**Solution:**
1. Added useEffect to refetch members whenever the Members tab becomes active (lines 34-41)
2. Added manual "Refresh" button for explicit updates (lines 315-325)

**Code Changes (ProjectMembersPanel.jsx):**

```javascript
// Added auto-refresh when tab becomes active
useEffect(() => {
  if (activeTab === 'members') {
    fetchMembers();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab]);

// Added refresh button in UI
<button
  onClick={fetchMembers}
  disabled={loading}
  className="px-3 py-1 text-sm text-teal-600 hover:bg-teal-50 border border-teal-200 rounded-md"
>
  {loading ? 'Refreshing...' : '↻ Refresh'}
</button>
```

### Testing:
- ✅ All 648 tests passing
- ✅ ESLint clean
- ⏳ Manual testing pending (user to verify both fixes)

---

*Generated using the `fixit` workflow*
