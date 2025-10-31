# start-session - Intelligent Session Initialization

**Trigger:** User says "start lonch session", "start session", or "begin lonch session"

## Purpose

Automatically load all project context, check current state, find where we left off, and present a session menu.

---

## Execution Steps

### Step 1: Detect Project & Navigate

If user says "start [project-name] session":
- Navigate to project directory based on project name
- For "lonch": `cd /Users/cfletcher/Documents/lonch-project/lonch/lonch-app`
- For other projects: Look in known project locations or ask

If already in a project directory:
- Detect project from `.claude/` configuration files
- Proceed with that project's context

### Step 2: Load Project Context

Read project-specific configuration files in parallel:

**Required files:**
- `.claude/lonch-preferences.md` (or equivalent project preferences file)
- `package.json` - Tech stack and scripts
- `README.md` (first 100 lines) - Project overview

**Optional files (if they exist):**
- `.claude/SESSION_STATE.md` - Last session summary
- `CHANGELOG.md` (first 50 lines) - Recent changes
- `CLAUDE.md` - AI-specific instructions

**Purpose:** Understand:
- Project tech stack
- Branding/style guidelines
- Quality requirements
- Available workflows
- Communication preferences

### Step 3: Check Git State

Run these commands in parallel:

```bash
git branch --show-current
git status
git log --oneline -5
git diff --stat
```

**Extract:**
- Current branch name
- Working tree status (clean/dirty)
- Number of modified files
- Recent commits (shows recent work)
- Uncommitted changes

**⚠️ Branch Warning:**
- If on `main` branch, immediately warn that work should NEVER be done on main
- Remind to create a branch before any work

### Step 4: Find Active Work

Check for in-progress tasks:

```bash
ls -la specs/tasks-*.md
```

For each task file found:
- Read the file
- Count total tasks vs completed tasks
- Calculate progress percentage
- Identify next pending task
- Note the associated PRD and GitHub issue number

### Step 5: Read Last Session State

If `.claude/SESSION_STATE.md` exists, read it to find:
- What we worked on last time
- Any blockers or notes
- Planned next steps
- Context that might not be in git/files

### Step 6: Check Development Environment

Verify environment status:

```bash
# Check dependencies installed
ls -la node_modules > /dev/null 2>&1 && echo "✅ Dependencies installed" || echo "⚠️  Need to run: npm install"

# Check for background processes
/bashes
```

**If background processes found:**
- List them
- Note if dev server is running
- Suggest cleanup if multiple servers running

### Step 7: Check Notion Integration (Optional)

If Notion MCP is available:
- Test connection
- Look for recent notes/tasks related to this project
- Include in context summary

### Step 8: Present Session Summary

Display a comprehensive summary:

```
🎯 Lonch Development Session Started

## Current Context
📍 Directory: /Users/cfletcher/Documents/lonch-project/lonch/lonch-app
🌿 Branch: feature/50-notification-preferences
📊 Git Status: 3 files modified (uncommitted)
🔧 Environment: ✅ Dependencies installed, ✅ Dev server running (pid 12345)

## Recent Activity
Latest Commit: feat: add notification UI components (2 hours ago)
Recent Changes:
  - src/components/NotificationPrefs.jsx (modified)
  - src/services/notificationService.js (modified)
  - tests/notificationService.test.js (modified)

## Active Work
📝 Task List: specs/tasks-0007-prd-notification-preferences.md
   Progress: 8/12 tasks complete (67%)

Current Task: 2.3 Implement notification delivery service
Next Tasks:
  - 2.4 Add email notification support
  - 3.1 Write integration tests
  - 3.2 Manual testing in browser

## Last Session Notes
(From .claude/SESSION_STATE.md if exists)
- Completed UI components for notification preferences
- Need to decide on email provider (SendGrid vs AWS SES)
- Reminder: Test with production Firebase instance

## What would you like to do today?

1. 🔄 Continue current work → Resume Task 2.3: Notification delivery service
2. 🚀 Start new feature → Run /shazam
3. 🔧 Fix a bug → Run fixit workflow
4. ✅ Wrap up current work → Run /lonchit (commit, push, update issue)
5. 📋 Review progress → View task list and recent commits
6. 🎨 Other → Tell me what you need

Select an option (1-6) or describe what you need.
```

### Step 9: Wait for User Direction

After presenting summary, wait for user to:
- Select a numbered option
- Describe what they want to work on
- Ask questions about the current state

Do NOT assume what they want to do - let them direct.

---

## Context Confirmation

After loading context, I should understand:

### Project Specifics
- Tech stack (e.g., React 19, Vite, Tailwind CSS v3.4)
- Brand guidelines (colors, typography, naming)
- Dev server command and URL

### Quality Requirements
- Testing requirements (coverage %, TDD approach)
- Pre-commit checks (tests, linting, build)
- Documentation standards

### Available Workflows
- Feature development (e.g., `/shazam`)
- Bug fixing (e.g., `fixit`)
- Wrap-up (e.g., `/lonchit`)
- Resume work (e.g., `/resume`)

### Git Workflow
- Branch naming conventions
- Never work on main
- GitHub CLI usage
- Commit message format

### File Structure
- Where PRDs live (e.g., `/specs/`)
- Where bug reports live (e.g., `/bugs/`)
- Source code location (e.g., `/src/`)

---

## Special Cases

### If Not in a Project Directory

```
⚠️  Not currently in a project directory.

Which project would you like to work on?
1. Lonch (/Users/cfletcher/Documents/lonch-project/lonch/lonch-app)
2. [Other projects if known]
3. Specify a different path

Or navigate to your project directory first and run this command again.
```

### If No Git Repository

```
⚠️  This doesn't appear to be a Git repository.

Would you like me to:
1. Initialize Git in this directory
2. Navigate to a different project
3. Continue without Git workflows (limited functionality)
```

### If No .claude/ Configuration

```
⚠️  No .claude/ configuration found.

This doesn't appear to be a Claude Code configured project.

Would you like me to:
1. Set up Claude Code configuration for this project
2. Navigate to a different project
3. Continue with limited context
```

### If Session State File Doesn't Exist

This is normal for:
- First time running this command
- Fresh project setup
- Sessions that ended abruptly

Simply proceed without last session context and rely on git/task state.

---

## Error Handling

### GitHub CLI Not Authenticated
- Note in summary but don't block
- Workflows will still work (except issue creation/updates)
- Suggest: `gh auth login`

### Node Modules Missing
- Flag in summary
- Suggest: `npm install` before starting work

### Multiple Background Processes
- List all running processes
- Suggest cleaning up old ones
- Offer to kill specific processes

---

## Integration with Other Workflows

This command complements existing workflows:

- **After start-session → Select `/shazam`** to begin new feature
- **After start-session → Select continue** to use `/resume`
- **After start-session → Select wrap up** to use `/lonchit`
- **During work → End with `/lonchit`** which updates SESSION_STATE.md
- **Next session → Use start-session** to pick up where you left off

---

## Template for Other Projects

To use this pattern for another project:

1. Create `.claude/[project-name]-preferences.md` with project-specific settings
2. Create `.claude/commands/start-session.md` (reuse this file)
3. Update project detection logic to include new project path
4. Say "start [project-name] session"

---

## Notes

- **Stateless:** Each session starts fresh by reading files
- **Fast:** Parallel file reads minimize startup time
- **Comprehensive:** Gives full picture of current state
- **Actionable:** Presents clear next step options
- **Flexible:** User controls what happens next

---

*Last Updated: 2025-10-30*
*Part of the Claude Code session management system*
