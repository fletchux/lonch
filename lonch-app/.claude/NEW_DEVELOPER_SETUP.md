# New Developer Setup - Claude Code Onboarding

This is the **complete initial prompt** for a new developer to give to Claude Code to get fully set up and ready to work on the Lonch project.

---

## Initial Prompt for Claude Code

Copy and paste this entire prompt when starting a new Claude Code session:

```
Hi Claude! I'm a new developer on the Lonch project and need you to get fully set up with all context and capabilities.

Please execute the following setup sequence:

## 1. Load Project Context

Navigate to the Lonch project and load all critical context files:

```bash
cd /Users/cfletcher/Documents/lonch-project/lonch/lonch-app
```

Read these files in parallel to understand the project:
- `.claude/lonch-preferences.md` - Project configuration and preferences
- `.claude/session-startup.md` - Session initialization workflow
- `.claude/commands/README.md` - Slash command reference
- `.claude/commands/shazam.md` - Feature automation workflow
- `.claude/commands/lonchit.md` - Wrap-up and ship workflow
- `.claude/fixit-workflow.md` - Bug fixing workflow
- `.github/GETTING_STARTED.md` - Complete development workflow
- `README.md` (first 100 lines) - Project overview
- `CHANGELOG.md` (first 50 lines) - Recent changes
- `package.json` - Dependencies and scripts
- `CLAUDE.md` - AI-specific instructions

## 2. Understand Git State

Check the current git status:

```bash
git branch --show-current
git status
git log --oneline -5
```

**Critical Branch Check:**
- If on `main` branch, remind me that work should NEVER be done directly on main
- All work (bugs, features, improvements) requires a new branch first
- Branch naming: `bug/XX-description`, `feature/XX-name`, or `improve/description`

## 3. Check Available Workflows

List the available slash commands and workflows:

```bash
ls -la .claude/commands/
ls -la .claude/workflows/
```

## 4. Verify Tools & Authentication

Check that essential tools are set up:

```bash
node --version
npm --version
gh auth status
git remote -v
```

## 5. Understand Active Work

Check for any in-progress work:

```bash
ls -la specs/tasks-*.md
```

Look for uncompleted tasks in task files and calculate progress.

## 6. Check Development Environment

Verify the dev environment is ready:

```bash
# Check if node_modules exists
ls -la node_modules > /dev/null 2>&1 && echo "Dependencies installed" || echo "Need to run: npm install"

# Check for background processes
/bashes
```

## 7. Load Notion Integration (if available)

Check if Notion MCP is configured for task management:
- Test connection to Notion workspace
- List available databases
- Understand how tasks sync to Notion (if configured)

## 8. Present Session Menu

After loading all context, present me with the intelligent session startup menu showing:

**Current Context:**
- Working directory
- Current git branch
- Git status (clean/dirty)
- Active tasks (if any)
- Recent commits

**Available Workflows:**
1. 🚀 Start new feature (`/shazam`)
   - Creates PRD, generates tasks, sets up branch and GitHub issue
2. 🔄 Resume existing work (`/resume`)
   - Loads context from active task list
3. 🔧 Fix a bug (`fixit`)
   - Document issue, create GitHub issue and bug-fix branch, TDD fix
4. 📋 Review PRDs/Specs
   - Browse existing PRDs and task progress
5. ✅ Quick commit & push
   - Review changes, commit, and push
6. 🎨 Other
   - Open-ended assistance

## 9. Confirm Capabilities

Confirm you understand:

### Project Specifics:
- Tech stack: React 19, Vite, Tailwind CSS v3.4, Vitest, Firebase
- Brand colors: Primary teal (#2D9B9B), Accent gold (#DBA507)
- Brand name: always lowercase "lonch" in user-facing text
- Dev server: `npm run dev` → http://localhost:5173/

### Quality Requirements:
- Before committing: tests pass, eslint clean, build succeeds
- Test coverage >80% for new code
- TDD approach (write tests first)
- Update CHANGELOG.md with all changes
- Include Claude co-author tag in commits

### Workflows Available:
- **`/shazam`** - Complete feature setup (PRD → Tasks → Issue → Branch)
- **`/resume`** - Load context and continue work
- **`/lonchit`** - Wrap up and ship (quality checks, commit, push)
- **`/create-prd`** - Create PRD only
- **`/generate-tasks`** - Generate tasks from PRD
- **`/process-task-list`** - Implement tasks with TDD
- **`fixit`** - Bug fixing workflow

### Git Workflow:
- **NEVER work on main branch directly**
- Always create branch: `bug/XX-desc`, `feature/XX-name`, or `improve/desc`
- Use GitHub CLI for issues and PRs
- Reference issue numbers in commits (#XX)
- Clean up background processes (keep only ONE dev server)

### File Structure:
- `/specs/` - PRDs and task lists
- `/bugs/` - Bug reports
- `/src/` - Source code
- `/.claude/` - Claude Code configuration
- `/.github/` - GitHub workflows and documentation

### Communication Style:
- Concise, direct answers
- Explain technical decisions when asked
- Proactive but ask before major changes
- Run tools in parallel when possible
- Use TodoWrite tool for multi-step tasks

## 10. Ask for Direction

After confirming all of the above, ask me:

"What would you like to work on today?"

And wait for my response to select from the session menu.
```

---

## What This Setup Does

This initial prompt will:

1. **Navigate to project** - Changes to correct working directory
2. **Load all context** - Reads configuration, workflows, and documentation
3. **Check git state** - Ensures proper branch and clean working tree
4. **Verify tools** - Confirms Node, npm, GitHub CLI are ready
5. **Find active work** - Locates any in-progress tasks
6. **Check environment** - Verifies dependencies and dev server status
7. **Test integrations** - Checks Notion MCP if configured
8. **Present menu** - Shows current context and available workflows
9. **Confirm understanding** - Validates Claude knows all project specifics
10. **Ready state** - Asks what you want to work on

---

## Expected Output

After running this prompt, Claude should respond with something like:

```
✅ Lonch Project Context Loaded

## Current Context
📍 Directory: /Users/cfletcher/Documents/lonch-project/lonch/lonch-app
🌿 Branch: main
📊 Git Status: Clean working tree
📝 Active Tasks: None
🔧 Tools: ✅ Node v20.x, ✅ npm v10.x, ✅ GitHub CLI authenticated

## Loaded Configurations
✅ Project preferences (.claude/lonch-preferences.md)
✅ Session startup workflow (.claude/session-startup.md)
✅ Slash commands (shazam, resume, lonchit, etc.)
✅ Bug fixing workflow (fixit)
✅ Quality requirements (TDD, tests, linting, build)

## Capabilities Confirmed
✅ Feature development with /shazam
✅ Bug fixing with fixit
✅ TDD implementation workflow
✅ GitHub integration (issues, PRs)
✅ Quality checks (tests, lint, build)
✅ Notion integration (if configured)

## What would you like to work on today?

1. 🚀 Start new feature
2. 🔄 Resume existing work
3. 🔧 Fix a bug
4. 📋 Review PRDs/Specs
5. ✅ Quick commit & push
6. 🎨 Other

Select an option (1-6) or describe what you need.
```

---

## Usage

**For a new developer:**
1. Open Claude Code in the terminal
2. Copy the "Initial Prompt for Claude Code" section above
3. Paste into Claude Code
4. Wait for Claude to load all context and present the menu
5. Select what you want to work on

**For an existing developer:**
- Just use the shortcuts like `/shazam`, `/resume`, or say "start lonch feature"
- This full setup is only needed when onboarding or starting fresh

---

## Customization

If your project setup differs, update these sections in the prompt:

- **Working directory path** - Line: `cd /Users/cfletcher/...`
- **File locations** - Adjust paths if you moved `.claude/` or `specs/`
- **Tool versions** - Update if using different Node/npm versions
- **Integrations** - Add/remove Notion or other MCP servers

---

*Last Updated: 2025-10-30*
*This file provides the complete onboarding prompt for new Claude Code developers*
