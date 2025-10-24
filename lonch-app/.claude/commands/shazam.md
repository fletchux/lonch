# Shazam - Launch New Feature Development

**This command automates the complete setup for a new feature from idea to ready-to-code.**

## What "shazam" does:

1. ✅ Ensures clean git state (on main, pulled latest)
2. ✅ Creates PRD through interactive questions (/.claude/workflows/create-prd.md)
3. ✅ Generates task list with TDD structure (/.claude/workflows/generate-tasks.md)
4. ✅ Creates GitHub issue automatically
5. ✅ Creates feature branch with issue number
6. ✅ Marks issue as "in-progress"
7. ✅ Sets up for TDD implementation

## Process

### Step 1: Pre-flight Checks
- Verify on main branch
- Check for uncommitted changes
- Pull latest from origin/main
- Verify no existing work in progress

### Step 2: Create PRD
Execute /.claude/workflows/create-prd.md workflow:
- Ask clarifying questions about the feature
- Generate detailed PRD
- Save to `/specs/XXXX-prd-feature-name.md`
- Note the PRD number (e.g., 0006)

### Step 3: Generate Tasks
Execute /.claude/workflows/generate-tasks.md workflow:
- Analyze PRD and existing codebase
- Generate parent tasks
- Wait for user "Go" confirmation
- Generate detailed sub-tasks with TDD structure
- **Automatically create GitHub issue**
- Save task list to `/specs/tasks-XXXX-prd-feature-name.md`
- Capture issue number (e.g., #45)

### Step 4: Create Feature Branch
```bash
git checkout -b feature/XX-feature-name
```
Where:
- XX is the GitHub issue number
- feature-name matches the PRD feature name

### Step 5: Update GitHub Issue
```bash
# Mark as in-progress
gh issue edit XX --add-label "in-progress"

# Add start comment
gh issue comment XX --body "🚀 Started feature development

**PRD:** specs/XXXX-prd-feature-name.md
**Task List:** specs/tasks-XXXX-prd-feature-name.md
**Branch:** feature/XX-feature-name
**Approach:** TDD (tests before implementation)

Following the structured workflow:
1. ✅ PRD created
2. ✅ Tasks generated
3. ✅ Branch created
4. ⏳ Ready to implement with /process-task-list

**Next:** Review task list and begin implementation"
```

### Step 6: Ready State Confirmation
Display summary to user:
```
✨ SHAZAM! Feature setup complete!

📋 PRD: specs/XXXX-prd-feature-name.md
📝 Tasks: specs/tasks-XXXX-prd-feature-name.md
🎫 Issue: #XX - [Feature Name]
🌿 Branch: feature/XX-feature-name
🏷️  Status: in-progress

Ready to code! Next steps:
1. Review the task list: cat specs/tasks-XXXX-prd-feature-name.md
2. Start implementation: /process-task-list
3. Follow TDD: Write tests → Implement → Verify

When done: lonchit
```

## Error Handling

### If not on main branch:
```
⚠️  Not on main branch (currently on: branch-name)
Please commit or stash changes and switch to main:
  git stash
  git checkout main

Then run: shazam
```

### If uncommitted changes:
```
⚠️  You have uncommitted changes
Please commit or stash them first:
  git status
  git add . && git commit -m "message"
  OR
  git stash

Then run: shazam
```

### If GitHub CLI not authenticated:
```
⚠️  GitHub CLI not authenticated
Please run: gh auth login
Then run: shazam
```

## Important Notes

- **Interactive:** This command requires user input during PRD creation
- **Time:** Allow 5-10 minutes for complete setup
- **Prerequisites:**
  - Git repository initialized
  - GitHub CLI authenticated
  - On main branch with clean state
- **TDD Enforced:** All generated tasks follow test-first approach

## Usage

Simply type:
```
/shazam
```

And follow the prompts!
