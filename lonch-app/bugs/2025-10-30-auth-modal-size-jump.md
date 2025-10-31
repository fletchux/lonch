# Bug Report: Auth Modal Size Jump

**Date**: 2025-10-30
**Reporter**: User
**Severity**: Medium (UX issue)
**Status**: ✅ RESOLVED
**Resolution**: Fixed in PR #26 (commit bda0f68)
**Branch**: bug/25-auth-modal-size-jump

## Description

The login modal and sign-up modal are different sizes, causing a noticeable visual "jump" when users switch between the two views. This creates a jarring user experience during authentication.

## Current Behavior

1. User opens the login modal
2. User clicks "Sign up" to switch to sign-up view
3. Modal expands vertically (gets taller due to "Confirm Password" field + validation error space)
4. User clicks "Log in" to switch back
5. Modal shrinks back to original size
6. The size change creates a distracting visual jump

## Expected Behavior

Both modals should maintain the same size when switching between login and sign-up views. The transition should be smooth without any layout shifts.

## Root Cause

### LoginPage (src/components/auth/LoginPage.jsx)
- 2 input fields (Email, Password)
- "Forgot password?" link between inputs and button
- No validation error messages displayed inline

### SignupPage (src/components/auth/SignupPage.jsx)
- 3 input fields (Email, Password, Confirm Password)
- Inline validation error messages under each field (takes up space even when not shown)
- Extra vertical space from the additional field

The SignupPage is taller due to:
1. Extra "Confirm Password" field
2. Space reserved for validation error messages (`<p className="text-red-600 text-xs mt-1">`)

## Reproduction Steps

1. Navigate to the login page
2. Click "Sign up" link at the bottom
3. Observe modal height increase
4. Click "Log in" link at the bottom
5. Observe modal height decrease

## Proposed Solution

Add a minimum height to both modal containers to match the taller SignupPage:

```jsx
// Both LoginPage.jsx and SignupPage.jsx
<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 min-h-[600px]">
```

This ensures both modals maintain consistent height regardless of content.

## Technical Details

- **Files affected**:
  - `src/components/auth/LoginPage.jsx:51`
  - `src/components/auth/SignupPage.jsx:86`
- **Current container class**: `max-w-md w-full bg-white rounded-lg shadow-lg p-8`
- **Proposed container class**: `max-w-md w-full bg-white rounded-lg shadow-lg p-8 min-h-[600px]`

## Acceptance Criteria

- [x] LoginPage modal has minimum height set
- [x] SignupPage modal has minimum height set
- [x] Both modals maintain the same size when switching views
- [x] No visual "jump" when clicking "Sign up" or "Log in" links
- [x] Modal content remains properly centered/aligned
- [x] Tests verify consistent modal sizing
- [x] All existing tests still pass

## Resolution Summary

**Fix Applied:** Added `min-h-[600px]` class to both modal containers

**Files Modified:**
- `src/components/auth/LoginPage.jsx` - Added minimum height to modal container
- `src/components/auth/SignupPage.jsx` - Added minimum height to modal container

**Tests Added:**
- `LoginPage.test.jsx` - Test verifying modal has minimum height class
- `SignupPage.test.jsx` - Test verifying modal has minimum height class

**Results:**
- ✅ 650/650 tests passing
- ✅ ESLint clean
- ✅ Production build successful
- ✅ No visual jump when switching between views

**Pull Request:** #26
**Commit:** bda0f68

## Labels

- `bug`
- `ui/ux`
- `authentication`
- `priority: medium`
