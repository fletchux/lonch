# AI Dev Tasks

## CRITICAL: Always Create a Branch First!
**NEVER commit directly to main.** Every task requires a new branch:

### Branch Naming Conventions:
- **Bug fixes**: `bug/<issue-number>-<short-description>` (e.g., `bug/14-fix-document-upload`)
- **New features**: `feature/<feature-name>` (e.g., `feature/document-visibility`)
- **Improvements**: `improve/<description>` (e.g., `improve/table-responsiveness`)

### Workflow:
1. **Start any task** → Create a branch from main
2. **Make changes** → Commit to the branch
3. **Testing complete** → Push branch and create PR
4. **User approval** → Merge PR to main

### Commands:
```bash
# Check current branch
git branch

# Create and switch to new branch
git checkout -b bug/XX-description

# After work is done
git push origin bug/XX-description
```

## Structured Feature Development
Use these files when I request structured feature development using PRDs:
/.claude/workflows/create-prd.md
/.claude/workflows/generate-tasks.md
/.claude/workflows/process-task-list.md
