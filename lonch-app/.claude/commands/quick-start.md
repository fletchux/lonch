# quick-start - Minimal Session Initialization

**Trigger:** User says "quick start" or "start session"

**Purpose:** Fast session startup with minimal token usage (~5K tokens vs 30K)

---

## Execution Steps

### Step 0: Detect & Navigate to Project (if needed)

**If user says "start [project-name] session" or "quick start [project-name]":**

1. Check current directory with `pwd`
2. Look for project-specific patterns:
   - "lonch" → `/Users/cfletcher/Documents/lonch-project/lonch/lonch-app`
   - Other projects → Check known locations or ask user
3. Navigate to project directory if not already there
4. Verify `.claude/session-config.json` exists

**If already in a project directory:**
- Detect project from `.claude/session-config.json` (read "project" field)
- Proceed with that project's context

**If in home directory or unknown location:**
```
⚠️  Not in a project directory.

Which project would you like to work on?
1. lonch (/Users/cfletcher/Documents/lonch-project/lonch/lonch-app)
2. Other (specify path)
```

### Step 1: Load Project Configuration
Read `.claude/session-config.json` for:
- Available commands
- Project paths
- Git rules
- Quality gates

### Step 2: Load Last Session State
Read `.claude/SESSION_STATE.md` (if exists) for:
- What we worked on last time
- Changes made
- Blockers/notes
- Next steps

### Step 3: Check Git State
Run in parallel:
```bash
git branch --show-current
git status
git log --oneline -3
```

Extract:
- Current branch name
- Working tree status (clean/dirty)
- Recent commits (context)
- Uncommitted changes count

**⚠️ Branch Warning:**
If on `main` branch, warn that work should NEVER be done directly on main.

### Step 4: Find Active Work
Check for in-progress tasks:
```bash
ls -la specs/tasks-*.md 2>/dev/null | head -10
```

If task files found, note which ones exist (don't read them yet - load on demand).

### Step 5: Check Development Environment
Quick checks:
```bash
ls -la node_modules > /dev/null 2>&1 && echo "✅ Dependencies installed" || echo "⚠️  Need: npm install"
```

Check if dev server is running (optional).

### Step 6: Present Session Menu

Display concise summary:

```
🎯 lonch Development Session

## Current State
📍 Branch: <branch-name>
📊 Status: <clean|N files modified>
📝 Last Session: <brief summary from SESSION_STATE.md>

## Recent Activity
<last 3 commits one-liner>

## Available Commands
<list from session-config.json>

## What would you like to do?
1. 🔄 Continue current work
2. 🚀 Start new feature (/shazam)
3. 🔧 Fix a bug (fixit)
4. 📋 Review PRDs/Specs
5. ✅ Wrap up current work (/lonchit)
6. 🎨 Other

Select an option (1-6):
```

### Step 7: Wait for User Direction

Do NOT assume what they want - wait for their choice.

---

## Files Read (Minimal)

**Total: 2 files + git commands**
1. `.claude/session-config.json` (~300 tokens)
2. `.claude/SESSION_STATE.md` (~1,000 tokens)
3. Git commands (minimal output)

**Total token cost: ~5K tokens (83% reduction from full startup)**

---

## When to Use Full Context

If user asks for:
- "Explain the session system" → Read `.claude/start-session.md`
- "Onboard new developer" → Read `.claude/ONBOARDING_PROMPT.txt`
- "Show full preferences" → Read `.claude/lonch-preferences.md`

**Keep full docs available but don't load at startup.**

---

## Special Cases

### If SESSION_STATE.md Doesn't Exist
This is normal for:
- First time using quick-start
- Fresh project setup
- Previous session ended abruptly

Simply proceed without last session context, rely on git state.

### If Not in Project Directory
Detect from `pwd` and navigate if needed, or ask user.

### If No Git Repository
Warn and offer to:
1. Initialize git
2. Navigate elsewhere
3. Continue without git (limited functionality)

---

**Last Updated:** 2025-10-31
**Purpose:** Fast, token-efficient session startup for daily use
