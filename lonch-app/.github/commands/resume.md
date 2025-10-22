# Resume Development Session

When the user says "resume" or "start session", execute this workflow to get oriented and ready to work.

## Workflow Steps

### 1. Review Project Memory & Context
- Read `.github/WORKFLOWS.md` to understand available workflows (lonchit, etc.)
- Read `CLAUDE.md` to understand AI development task workflows
- Read `CHANGELOG.md` (first 100 lines) to see recent changes
- Read `README.md` (first 100 lines) to understand project overview

### 2. Check Current Task Status
- Find and read the active task list file in `tasks/` directory
- Identify which tasks are complete (marked with [x])
- Identify the next pending task (marked with [ ])
- Note the overall progress percentage

### 3. Review Recent Work
- Run `git log --oneline -10` to see recent commits
- Check current branch with `git branch --show-current`
- Run `git status` to check for uncommitted changes

### 4. Verify Development Environment
- Run `npm test -- --reporter=verbose | head -50` to check test status (first 50 lines)
- Note total tests passing/failing
- Check if development server is needed

### 5. Present Session Startup Summary

Generate a concise summary including:

```
🚀 Session Resumed - Lonch Development

## Current Status
- Branch: [branch-name]
- Task List: [task-file-name]
- Progress: [X/Y] tasks complete ([percentage]%)

## Last Session Summary
[Brief summary from recent commits]

## Next Task: [Task Number and Name]
**Status:** [Not Started / In Progress / Blocked]
**Sub-tasks:**
- [ ] First sub-task
- [ ] Second sub-task
- [ ] Third sub-task

## Quick Context
[1-2 sentences about what we're building]

## Available Commands
- "lonchit" - Wrap up and ship workflow
- "resume" - This session startup (already done!)
- See .github/WORKFLOWS.md for more

## Ready to Work!
Would you like to:
1. Continue with [Next Task Name]
2. Review a different task
3. Run the dev server
4. Something else?
```

### 6. Wait for User Direction

After presenting the summary, wait for the user to decide what to work on next.

## Notes

- This command should be run at the START of each development session
- It helps Claude get oriented quickly without the user having to explain context
- Keep the summary concise but informative
- Always end by offering clear next step options
