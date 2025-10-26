# Session Startup - Intelligent Project Detection & Context Loading

**Purpose:** Automated session initialization with menu-driven workflow selection.

**Triggers:** User says "start lonch feature", "begin session", or similar phrases

## Overview

This workflow provides an intelligent startup experience that:
1. Detects current working directory and available projects
2. Loads project context automatically
3. Presents a menu of common workflows
4. Guides the user to the right next step

## Workflow Steps

### Step 1: Detect Current Location

Check if user is in a project directory or home directory:

```bash
pwd
```

**If in home directory (`/Users/cfletcher` or similar):**
- List available projects in `~/Documents/lonch-project/`
- Ask user which project to work on
- Navigate to selected project directory

**If already in a project directory:**
- Proceed to Step 2

### Step 2: Load Project Context

Read essential project files:
- `.claude/lonch-preferences.md` - Project-specific preferences
- `~/.claude-preferences.md` - Global user preferences
- `CHANGELOG.md` (first 50 lines) - Recent changes
- `README.md` (first 100 lines) - Project overview

### Step 3: Check Git Status

```bash
git branch --show-current
git status
git log --oneline -5
```

Determine:
- Current branch
- Any uncommitted changes
- Recent commits

**⚠️ CRITICAL BRANCH CHECK:**
- **If on `main` branch:** Immediately warn user that work should NEVER be done directly on main
- **Always create a branch** before starting any work (bugs, features, improvements)
- Use naming convention: `bug/XX-description`, `feature/name`, or `improve/description`

### Step 4: Check for Active Work

Look for task files in `specs/` directory:
- Find any in-progress task lists (files with uncompleted tasks)
- Identify the next pending task
- Calculate progress percentage

### Step 5: Present Session Menu

Display a friendly menu with current context:

```
🎯 Welcome to Lonch Development!

## Current Context
📍 Directory: /Users/cfletcher/Documents/lonch-project/lonch/lonch-app
🌿 Branch: main
📊 Git Status: Clean working tree
📝 Active Tasks: [None / List active task file]

## What would you like to do today?

1. 🚀 Start new feature
   - Creates PRD, generates tasks, sets up branch
   - Uses /shazam workflow

2. 🔄 Resume existing work
   - Loads context from active task list
   - Shows next pending tasks
   - Uses /resume workflow

3. 🔧 Fix a bug
   - Document issue with guided questions
   - Create GitHub issue and bug-fix branch
   - Uses fixit workflow with TDD

4. 📋 Review PRDs/Specs
   - Browse existing PRDs
   - Check task progress
   - Generate new tasks for existing PRD

5. ✅ Quick commit & push
   - Review changes
   - Commit to current branch
   - Push to remote

6. 🎨 Other
   - Open-ended assistance
   - Custom workflow

**Select an option (1-6):**
```

### Step 6: Execute Selected Workflow

Based on user selection:

#### Option 1: Start New Feature
1. Verify on main branch (if not, ask to switch)
2. Pull latest changes
3. Execute `/shazam` workflow
   - Interactive PRD creation
   - Task list generation
   - GitHub issue creation
   - Feature branch creation

#### Option 2: Resume Existing Work
1. Execute `/resume` workflow
   - Load active task list
   - Display next tasks
   - Show recent commits
   - Present continuation options

#### Option 3: Fix a Bug
1. Execute `fixit` workflow (`.claude/fixit-workflow.md`)
   - Ask conversational questions about the bug
   - Create bug report in `bugs/` directory
   - Create GitHub issue
   - Create bug-fix branch
   - Guide through TDD fix process

#### Option 4: Review PRDs/Specs
1. List all PRDs in `specs/` directory
2. For each PRD, show:
   - PRD number and name
   - Associated task list (if exists)
   - Completion status
3. Allow user to:
   - Read a PRD
   - Generate tasks for PRD
   - Continue work on existing tasks

#### Option 5: Quick Commit & Push
1. Run `git status` to show changes
2. Review changed files
3. Ask for commit message
4. Stage, commit, and push
5. Update GitHub issue if applicable

#### Option 6: Other
1. Ask user what they need help with
2. Provide open-ended assistance

## Example Interactions

### Example 1: User Starting Fresh Session

**User:** "start lonch feature"

**Claude:**
```
🎯 Welcome to Lonch Development!

## Current Context
📍 Directory: /Users/cfletcher/Documents/lonch-project/lonch/lonch-app
🌿 Branch: main
📊 Git Status: Clean working tree
📝 Active Tasks: None

## What would you like to do today?

1. 🚀 Start new feature
2. 🔄 Resume existing work
3. 📋 Review PRDs/Specs
4. ✅ Quick commit & push
5. 🎨 Other

**Select an option (1-5):**
```

**User:** "1"

**Claude:** "Great! Let's start a new feature using the shazam workflow. First, I'll make sure you're on main with the latest changes..."

[Executes /shazam workflow]

### Example 2: User Has Work in Progress

**User:** "begin session"

**Claude:**
```
🎯 Welcome Back to Lonch Development!

## Current Context
📍 Directory: /Users/cfletcher/Documents/lonch-project/lonch/lonch-app
🌿 Branch: feature/45-notification-system
📊 Git Status: 3 files modified
📝 Active Task: specs/tasks-0006-prd-notification-system.md
   Progress: 8/12 tasks complete (67%)

## Last Session:
Latest commit: feat: add notification preferences UI (2 hours ago)

## What would you like to do today?

1. 🚀 Start new feature (will need to commit/stash current work first)
2. 🔄 Resume existing work → Continue with Task 2.3: Implement notification delivery service
3. 📋 Review PRDs/Specs
4. ✅ Quick commit & push → Commit your 3 modified files
5. 🎨 Other

**Select an option (1-5):**
```

**User:** "2"

**Claude:** "Perfect! Let's continue with the notification system. Loading your task list..."

[Executes /resume workflow]

## Implementation Notes

- **Stateless:** Each session starts fresh by reading files
- **Context-aware:** Adapts menu based on current git state and active work
- **Flexible:** User can always choose "Other" for custom requests
- **Efficient:** Minimizes token usage by reading only necessary context
- **Helpful:** Guides users to the right workflow without assuming intent

## Error Handling

### If Git Not Initialized
```
⚠️  This doesn't appear to be a Git repository.
Would you like me to:
1. Initialize Git in this directory
2. Navigate to a different project
3. Continue without Git workflows
```

### If Multiple Active Branches
```
⚠️  You have uncommitted changes on feature/45-notification-system
but you're currently on main.

Would you like to:
1. Switch to feature/45-notification-system and continue work
2. Commit/stash changes and start fresh
3. Review the changes first
```

### If GitHub CLI Not Authenticated
```
⚠️  GitHub CLI not authenticated (needed for issue creation)
Run: gh auth login

You can still:
- Create PRDs
- Generate tasks
- Work locally
```

## Usage

**Trigger Phrases:**
- "start lonch feature"
- "begin session"
- "what can we work on"
- "show me options"

**Manual Invocation:**
User can always reference this workflow by asking for the session startup menu.
