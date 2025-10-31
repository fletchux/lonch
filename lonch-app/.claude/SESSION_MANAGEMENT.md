# Session Management System

Quick reference for starting and ending Claude Code sessions on the Lonch project.

---

## Starting a Session

### Command
```
start lonch session
```

### What Happens
Claude will automatically:

1. **Load Project Context**
   - Preferences (branding, tech stack, quality standards)
   - Workflows (shazam, lonchit, fixit, resume)
   - Recent changes (CHANGELOG, README)

2. **Check Git State**
   - Current branch
   - Uncommitted changes
   - Recent commits

3. **Find Active Work**
   - Task files in `specs/`
   - Progress on current tasks
   - Associated GitHub issues

4. **Read Last Session**
   - `.claude/SESSION_STATE.md` (if exists)
   - What you worked on
   - Blockers/notes
   - Planned next steps

5. **Check Environment**
   - Dependencies installed
   - Background processes
   - Dev server status

6. **Present Summary**
   ```
   🎯 Lonch Development Session Started

   ## Current Context
   📍 Directory: ...
   🌿 Branch: feature/50-notification-preferences
   📊 Git Status: 3 files modified

   ## Active Work
   📝 Task List: specs/tasks-0007-...
   Progress: 8/12 tasks (67%)
   Current Task: 2.3 Implement notification delivery

   ## Last Session Notes
   - Completed UI components
   - Need to decide on email provider

   ## What would you like to do today?
   1. 🔄 Continue current work
   2. 🚀 Start new feature
   3. 🔧 Fix a bug
   4. ✅ Wrap up current work
   5. 📋 Review progress
   6. 🎨 Other
   ```

---

## During the Session

Work normally using your workflows:
- `/shazam` - Start new feature
- `/resume` - Continue work
- `fixit` - Fix a bug
- Regular coding, testing, committing

---

## Ending a Session

### Proper Ending (Use `/lonchit`)

Run `/lonchit` when you're done working. It will:

1. ✅ Run quality checks (tests, lint, build)
2. ✅ Review changes
3. ✅ Create git commit
4. ✅ Update CHANGELOG.md
5. ✅ Update GitHub issue
6. ✅ Push to remote
7. ✅ **Write `.claude/SESSION_STATE.md`**

The SESSION_STATE.md will contain:
- What you worked on
- Changes made
- Testing done
- Blockers/notes
- Next steps

**This is what the next session will read to know where you left off.**

### Abrupt Ending (Token Limit, Need to Stop)

If you can't run `/lonchit`:

**Option 1: Quick Manual Update**
```bash
# Edit .claude/SESSION_STATE.md manually
# Add a quick note about what you were doing
```

**Option 2: Rely on Git State**
- Commit your work if possible
- Next session will detect uncommitted changes
- Git history will show recent work

---

## Session State File

### Location
`.claude/SESSION_STATE.md`

### Format
```markdown
# Last Session: 2025-10-30

## What We Worked On
- Feature: Notification Preferences (Issue #50)
- Branch: feature/50-notification-preferences
- Completed: Tasks 1.1-1.4
- Status: Ready for testing

## Changes Made
- src/components/NotificationPrefs.jsx: User preference UI
- src/services/notificationService.js: API integration
- tests/: 12 new unit tests

## Testing
- Tests added: 15 tests (92% coverage)
- Manual testing: Tested in dev Firebase

## Blockers/Notes
- Need to decide: SendGrid vs AWS SES
- TODO: Test with production Firebase

## Next Steps
- Manual testing with production
- Create PR to main
- Update documentation
```

### Who Updates It
- **Automatically:** `/lonchit` writes it at end of session
- **Manually:** You can edit it if needed
- **Read by:** `start lonch session` at beginning of next session

---

## Pattern for Other Projects

This system works for any project:

### 1. Set Up Project
```
your-project/
├── .claude/
│   ├── [project]-preferences.md    # Project config
│   ├── commands/
│   │   └── start-session.md        # Copy from lonch
│   │   └── lonchit.md              # Copy from lonch
│   └── SESSION_STATE.md            # Auto-generated
```

### 2. Start Sessions
```
start [project-name] session
```

### 3. End Sessions
```
/lonchit
```

---

## Benefits

### For You
- **No mental overhead** - Just say "start lonch session"
- **Instant context** - Know exactly where you left off
- **Smooth continuity** - Pick up work seamlessly
- **Works across token limits** - State persists in files

### For Claude
- **Full context** - Understands your project completely
- **Knows history** - Sees what was done last time
- **Understands blockers** - Aware of pending decisions
- **Ready to work** - Immediately productive

---

## Example Full Workflow

### Session 1 - Start Feature
```
You: start lonch session
Claude: [Shows context, you're on main, no active work]

You: 1 (start new feature)
Claude: [Runs /shazam]
- Creates PRD
- Generates tasks
- Creates issue #50
- Creates branch feature/50-notifications

[Work on tasks 1.1-1.4]

You: /lonchit
Claude: [Runs quality checks, commits, pushes, updates SESSION_STATE.md]
```

### Session 2 - Continue Work
```
You: start lonch session
Claude:
  📍 Branch: feature/50-notifications
  📝 Progress: 4/12 tasks (33%)
  📋 Last Session: Completed UI components, need to decide on email provider

  What would you like to do?

You: 1 (continue current work)
Claude: Let's pick up with Task 2.1: Implement email service
```

### Session 3 - Token Limit Hit
```
[Working on tasks...]

Claude: [⚠️ Approaching token limit]

You: Quick - commit what we have
Claude: [Commits with descriptive message]

[Session ends abruptly - SESSION_STATE.md not updated]
```

### Session 4 - Resume After Token Limit
```
You: start lonch session
Claude:
  📍 Branch: feature/50-notifications
  📝 Progress: 8/12 tasks (67%)
  📋 Latest Commit: "feat: add email service integration" (30 min ago)
  ⚠️  3 files modified (uncommitted)

  Looks like last session ended abruptly. Let me check git diff...

  You were working on: Task 3.1 Integration tests

  Would you like to continue?
```

---

## Tips

1. **Always start with "start lonch session"**
   - Gets you full context
   - Shows where you left off
   - Presents clear options

2. **Always end with `/lonchit` if possible**
   - Ensures quality
   - Updates session state
   - Next session will be smooth

3. **If you hit token limits**
   - Try to commit before ending
   - Quick update to SESSION_STATE.md if you can
   - Don't worry if you can't - git state works too

4. **Review SESSION_STATE.md periodically**
   - Make sure it reflects reality
   - Add manual notes if needed
   - It's a living document

---

*Last Updated: 2025-10-30*
*This system enables seamless session continuity for Claude Code development*
