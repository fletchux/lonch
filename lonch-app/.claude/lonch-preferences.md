# Lonch Project Preferences

## Project Information
- **Project Name**: Lonch
- **GitHub Repo**: `git@github.com:fletchux/lonch.git`
- **Working Directory**: `/Users/cfletcher/Documents/lonch-project/lonch/lonch-app`
- **Dev Server**: `npm run dev` → `http://localhost:5173/`

## Branding Guidelines

### Colors
- **Primary Brand Color (Teal)**: `#2D9B9B`
- **Accent Color (Gold)**: `#DBA507`
- **Accent Dark**: `#B88906`
- **Background Gradient**: `from-blue-50 to-indigo-100`

### Typography & Text
- **Brand Name**: Always lowercase "lonch" in user-facing text (not "Lonch")
- **Tagline**: "Consultant project kickoff made simple"
  - Stored as `TAGLINE` constant in `src/components/pages/Home.jsx`
  - Use heavier font weight (font-medium)

### Logo
- **Location**: `src/assets/lonch_logo.svg`
- **Size**: `h-16` (20% larger than initial implementation)
- **Layout**: Logo above tagline, left-aligned with gap-3

## Tech Stack

### Dependencies
- **React**: 19.x
- **Vite**: 7.1.x
- **Tailwind CSS**: v3.4 (NOT v4 - v4 has compatibility issues)
- **Vitest**: For testing
- **React Testing Library**: For component tests
- **ESLint**: Code quality

### Important Notes
- Tailwind v4 doesn't work properly - always use v3.4
- Dev server needs restart after Tailwind config changes
- PostCSS config must use `tailwindcss: {}` format for v3

## Session Startup

### Menu-Driven Workflow Selection
When starting a session, use the intelligent session startup workflow:

**Trigger phrases:** "start lonch feature", "begin session"

**What it does:**
1. Detects current directory (home vs project)
2. Loads project context automatically
3. Presents menu of common workflows:
   - 🚀 Start new feature (`/shazam`)
   - 🔄 Resume existing work (`/resume`)
   - 📋 Review PRDs/Specs
   - ✅ Quick commit & push
   - 🎨 Other (open-ended)

**See:** `.claude/session-startup.md` for full workflow details

### Quick Commands
- `/shazam` - Complete feature setup (PRD → Tasks → Issue → Branch)
- `/resume` - Load context and continue existing work
- `/lonchit` - Wrap up and ship (tests, commit, push, docs)
- See `.claude/commands/README.md` for all slash commands

## Workflow Preferences

### Before Committing
1. Run test suite: `npm test`
2. Run ESLint: `npx eslint .`
3. Run production build: `npm run build`
4. All must pass before commit

### Git Workflow
- Update CHANGELOG.md with changes
- Use descriptive commit messages
- Include co-author tag: `Co-Authored-By: Claude <noreply@anthropic.com>`
- Get approval before major changes (user prefers control)

### Background Processes
- Keep only ONE dev server running at a time
- Clean up old background processes to avoid clutter
- Kill servers when done working

## Communication Preferences

### Style
- Concise, direct answers
- Explain technical decisions when asked
- Be proactive but ask before major changes
- Run tools in parallel when possible for efficiency

### Learning Mode
- User is learning Claude Code for the first time
- Explain new concepts clearly (plan mode, background tasks, etc.)
- Provide context for technical decisions

## Project Structure

```
lonch-app/
├── .claude/
│   ├── commands/           # Slash commands (shazam, resume, lonchit, etc.)
│   ├── workflows/          # Detailed workflow files (PRD, tasks)
│   ├── session-startup.md  # Menu-driven session initialization
│   └── lonch-preferences.md # This file
├── .github/
│   ├── WORKFLOWS.md        # Complete workflow documentation
│   ├── GETTING_STARTED.md  # Onboarding guide
│   └── GITHUB_CLI_REFERENCE.md
├── specs/                  # PRDs and task lists (formerly /tasks/)
│   ├── 0001-prd-upload-contracts-and-specs.md
│   ├── tasks-0001-prd-upload-contracts-and-specs.md
│   └── ... (all PRDs and task lists)
├── src/
│   ├── components/
│   │   ├── icons/          # Reusable icon components
│   │   └── pages/          # Page components (Home, Wizard, ProjectDashboard)
│   ├── data/
│   │   └── templates.js    # Template data structures
│   ├── assets/
│   │   └── lonch_logo.svg  # Official logo
│   ├── App.jsx             # Main app component
│   └── index.css           # Tailwind imports
├── tailwind.config.js      # Custom colors defined here
├── postcss.config.js       # Tailwind v3 config
└── CHANGELOG.md            # Keep updated
```

## Key Decisions Made

### Migration Decisions
- Migrated from single HTML file to React component architecture
- Created reusable icon components from SVG elements
- Implemented LonchO icon component from logo "o" element
- Organized templates into separate data file

### Design Decisions
- Changed "Ready to Lonch?" → "Ready to lonch?" (lowercase l)
- Removed text "Lonch" next to logo (logo speaks for itself)
- Made tagline a constant for easy global updates
- Original gradient restored after experimentation

## Common Issues & Solutions

### Issue: Buttons appear white after color change
**Solution**: Restart dev server to reload Tailwind config

### Issue: Tailwind styles not loading
**Solution**: Check Tailwind version (must be v3.4), verify postcss.config.js format

### Issue: Multiple background tasks
**Solution**: Kill old dev servers, keep only one instance running

---

## Recent Changes (2025-10-24)

### Workflow Reorganization
- ✅ Moved `/tasks/` → `/specs/` for PRDs and task lists
- ✅ Created session startup workflow (`.claude/session-startup.md`)
- ✅ Moved `resume` to slash commands (`.claude/commands/resume.md`)
- ✅ Created `lonchit` slash command (`.claude/commands/lonchit.md`)
- ✅ Created slash command reference (`.claude/commands/README.md`)
- ✅ Updated all workflow files to reference `/specs/`

### Directory Changes
- All PRDs moved from `docs/prds/` to `specs/`
- All task lists moved from `docs/prds/` to `specs/`

---

*Last Updated: 2025-10-24*
*This file helps maintain consistency across development sessions*
