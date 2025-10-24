# Bug Tracking System

This directory contains bug reports and issue documentation for the Lonch project.

## Overview

Bug reports are created through the `fixit` workflow, which guides you through:
1. Describing the issue
2. Identifying where it occurs
3. Documenting reproduction steps
4. Creating a GitHub issue
5. Setting up a bug-fix branch
6. Following TDD to fix the issue

## Directory Structure

```
bugs/
├── README.md                           # This file
├── BUG-REPORT-TEMPLATE.md             # Template for new bug reports
└── YYYY-MM-DD-short-description.md    # Individual bug reports
```

## Workflow

### Starting a Bug Fix

**Trigger:** Say "fixit" to Claude

Claude will:
1. Ask clarifying questions about the bug
2. Create a bug report file (`YYYY-MM-DD-description.md`)
3. Create a GitHub issue
4. Create a bug-fix branch (`bug/XX-description`)
5. Mark the issue as "in-progress"
6. Guide you through TDD fix process

### Bug Report Naming Convention

**Format:** `YYYY-MM-DD-short-description.md`

**Examples:**
- `2025-10-24-login-redirect-error.md`
- `2025-10-24-document-upload-timeout.md`
- `2025-10-25-group-badge-color-incorrect.md`

**Why this format?**
- Chronological sorting
- Easy to identify when bugs were reported
- Descriptive names for quick reference

### Bug Fix Process (TDD)

1. **Write Failing Test**
   - Create a test that reproduces the bug
   - Run test to verify it fails
   - This proves you've captured the bug

2. **Implement Fix**
   - Make the minimal change to fix the bug
   - Follow existing code patterns
   - Keep changes focused

3. **Verify Fix**
   - Run the test to verify it passes
   - Run full test suite (no regressions)
   - Manual testing if needed

4. **Complete**
   - Use `/lonchit` to wrap up
   - Updates GitHub issue
   - Commits changes
   - Pushes to remote

### Severity Levels

**Critical**
- App completely broken
- Data loss or corruption
- Security vulnerabilities
- Core features unusable

**High**
- Major feature broken
- Workaround exists but difficult
- Affects many users
- Performance issues

**Medium**
- Minor feature issue
- Cosmetic problems with functionality impact
- Edge cases that affect some users

**Low**
- Cosmetic issues only
- Nice-to-have improvements
- Rare edge cases
- Documentation issues

## Integration with GitHub

Each bug report is linked to a GitHub issue:
- Bug report file contains issue number
- GitHub issue links back to bug report
- Branch name includes issue number
- Commits reference issue number

## File Lifecycle

1. **Created** - Bug discovered, report written
2. **In Progress** - Actively being fixed
3. **Fixed** - Fix implemented and tested
4. **Verified** - Confirmed working in production
5. **Archived** - Can be moved to `bugs/archive/` after verification

## Tips

- **Be descriptive:** Good bug titles help future searches
- **Include reproduction steps:** Make it easy to reproduce
- **Add screenshots:** Visual evidence is helpful
- **Note your environment:** Browser, OS, etc.
- **Link related issues:** Reference similar bugs or features
- **Update the report:** Add findings as you investigate

## Related Documentation

- `.claude/fixit-workflow.md` - Complete fixit workflow
- `.github/WORKFLOWS.md` - All development workflows
- `specs/` - Feature PRDs and task lists

---

*Last Updated: 2025-10-24*
