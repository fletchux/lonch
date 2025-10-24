# Claude Code Slash Commands Reference

Quick reference for all available slash commands in the Lonch project.

## Feature Development Workflow

### `/shazam`
**Purpose:** Complete automation for starting a new feature from scratch

**What it does:**
1. ✅ Pre-flight checks (git state, branch, uncommitted changes)
2. ✅ Creates PRD through interactive Q&A
3. ✅ Generates TDD-structured task list
4. ✅ Creates GitHub issue automatically
5. ✅ Creates feature branch with issue number
6. ✅ Marks issue as "in-progress"
7. ✅ Ready to implement with TDD

**When to use:** Starting a brand new feature with full automation

**Example:**
```
/shazam
```

**Output:**
```
✨ SHAZAM! Feature setup complete!

📋 PRD: specs/0006-prd-notification-system.md
📝 Tasks: specs/tasks-0006-prd-notification-system.md
🎫 Issue: #45 - Notification System
🌿 Branch: feature/45-notification-system
```

---

### `/resume`
**Purpose:** Quick session startup to resume existing work

**What it does:**
1. Loads project context (workflows, changelog, README)
2. Finds active task list in `specs/`
3. Shows current progress
4. Reviews recent git commits
5. Runs quick test check
6. Presents next pending task

**When to use:** Starting a work session with existing in-progress features

**Example:**
```
/resume
```

**Output:**
```
🚀 Session Resumed - Lonch Development

## Current Status
- Branch: feature/45-notification-system
- Task List: specs/tasks-0006-prd-notification-system.md
- Progress: 8/12 tasks complete (67%)

## Next Task: 2.3 Implement notification delivery service
```

---

### `/lonchit`
**Purpose:** Complete wrap-up workflow to prepare feature for GitHub

**What it does:**
1. ✅ Run quality checks (tests, linter, build)
2. ✅ Self-review (security, performance, code quality)
3. ✅ Clean up code (remove debug logs, TODOs, commented code)
4. ✅ Update documentation (JSDoc, README, .env.example)
5. ✅ Create descriptive git commit
6. ✅ Update GitHub issue with completion summary
7. ✅ Update CHANGELOG.md
8. ✅ Push to remote
9. ✅ Generate summary report

**When to use:** Feature complete and ready to ship

**Example:**
```
/lonchit
```

**Output:**
```
✅ lonchit Complete!

Branch: feature/45-notification-system
Commit: 7e0eb0b
Issue: #45
Files Changed: 8 files, +342 insertions, -15 deletions

Features Added:
✓ Real-time notification system
✓ User preferences for notifications
✓ Email/in-app notification delivery

Tests Added:
✓ 24 unit tests (94% coverage)
✓ Integration tests for notification flow

Next Steps:
- Create pull request to main
```

---

## PRD & Task Management

### `/create-prd`
**Purpose:** Create a new Product Requirements Document

**What it does:**
- Asks clarifying questions about the feature
- Generates detailed PRD
- Saves to `specs/XXXX-prd-feature-name.md`

**When to use:** Want to create PRD without full shazam workflow

**Example:**
```
/create-prd
```

---

### `/generate-tasks`
**Purpose:** Generate task list from an existing PRD

**What it does:**
- Lists available PRDs in `specs/`
- Analyzes selected PRD
- Generates parent tasks (with user confirmation)
- Generates detailed sub-tasks with TDD structure
- Creates GitHub issue
- Saves to `specs/tasks-XXXX-prd-feature-name.md`

**When to use:** Have a PRD but need to create tasks

**Example:**
```
/generate-tasks
```

---

### `/process-task-list`
**Purpose:** Begin working through tasks in TDD workflow

**What it does:**
- Loads active task list
- Shows next pending task
- Follows TDD cycle (write test → implement → verify)
- Updates task list as work progresses

**When to use:** Ready to implement from a task list

**Example:**
```
/process-task-list
```

---

## Command Comparison

| Command | Creates PRD | Creates Tasks | Creates Issue | Creates Branch | Implements |
|---------|-------------|---------------|---------------|----------------|------------|
| `/shazam` | ✅ | ✅ | ✅ | ✅ | Ready to start |
| `/create-prd` | ✅ | ❌ | ❌ | ❌ | - |
| `/generate-tasks` | ❌ | ✅ | ✅ | ❌ | - |
| `/process-task-list` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/resume` | ❌ | ❌ | ❌ | ❌ | Context only |
| `/lonchit` | ❌ | ❌ | ❌ | ❌ | Wrap-up only |

---

## Typical Workflow

### Starting a New Feature (Full Automation)
```
1. /shazam                  → Complete setup (PRD, tasks, issue, branch)
2. /process-task-list       → Implement feature with TDD
3. /lonchit                 → Wrap up and ship
```

### Starting a New Feature (Manual Steps)
```
1. /create-prd              → Create PRD only
2. /generate-tasks          → Generate tasks from PRD
3. git checkout -b feature/XX-feature-name
4. /process-task-list       → Implement feature
5. /lonchit                 → Wrap up and ship
```

### Resuming Existing Work
```
1. /resume                  → Load context and see next tasks
2. /process-task-list       → Continue implementation
3. /lonchit                 → Wrap up when complete
```

---

## Manual Workflows

For manual workflows (not slash commands), see:
- `.claude/session-startup.md` - Menu-driven session initialization
- `.github/WORKFLOWS.md` - Complete workflow documentation
- `.claude/workflows/` - Detailed workflow files

---

## Tips

1. **Always start with `/shazam` for new features** - It's the fastest way to set everything up
2. **Use `/resume` at the start of each session** - Quick context loading
3. **Run `/lonchit` before creating PRs** - Ensures quality checks pass
4. **Slash commands are directory-specific** - Must be in project directory to use them
5. **Commands can be interrupted** - Just say "stop" if you need to change direction

---

*Last Updated: 2025-10-24*
*Location: `.claude/commands/README.md`*
