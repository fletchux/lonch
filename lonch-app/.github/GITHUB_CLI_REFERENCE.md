# GitHub CLI (gh) Command Reference

Quick reference for common GitHub CLI commands used in this project's workflows.

## Setup & Authentication

```bash
# Check if gh is installed
gh --version

# Login to GitHub
gh auth login

# Check authentication status
gh auth status

# Refresh auth token with additional scopes (needed for Projects)
gh auth refresh -s read:project,write:project
```

## Issues

### Creating Issues

```bash
# Create issue interactively
gh issue create

# Create issue with title and body
gh issue create --title "Bug: Login fails" --body "Description of the bug"

# Create issue from PRD file
gh issue create --title "PRD-0006: Notification System" \
  --body "$(cat tasks/0006-prd-notification-system.md)" \
  --label "feature,prd-0006"

# Create issue with multiple labels
gh issue create --title "Fix auth bug" --label "bug,high-priority"

# Assign issue to yourself
gh issue create --title "New feature" --assignee @me
```

### Viewing Issues

```bash
# List all open issues
gh issue list

# List issues with specific label
gh issue list --label "prd-0006"

# View specific issue
gh issue view 123

# View issue in web browser
gh issue view 123 --web

# View issue with JSON output
gh issue view 123 --json number,title,body,labels,state
```

### Updating Issues

```bash
# Add comment to issue
gh issue comment 123 --body "Progress update: Feature implemented"

# Add comment with multiline body
gh issue comment 123 --body "✅ Implementation complete.

**Changes:**
- Feature X implemented
- Tests added with 92% coverage

**Commit:** abc1234
**Branch:** feature/123-notification-system"

# Close an issue
gh issue close 123

# Close with comment
gh issue close 123 --comment "Fixed in PR #45"

# Reopen an issue
gh issue reopen 123

# Edit issue title
gh issue edit 123 --title "New title"

# Add labels to existing issue
gh issue edit 123 --add-label "needs-testing"

# Remove labels
gh issue edit 123 --remove-label "in-progress"
```

## Pull Requests

### Creating PRs

```bash
# Create PR interactively
gh pr create

# Create PR with title and body
gh pr create --title "feat: add notification system" \
  --body "Implements PRD-0006. Closes #123"

# Create PR to specific branch
gh pr create --base main --head feature/123-notifications

# Create draft PR
gh pr create --draft

# Create PR with reviewers
gh pr create --reviewer username1,username2
```

### Viewing PRs

```bash
# List open PRs
gh pr list

# View specific PR
gh pr view 45

# View PR in browser
gh pr view 45 --web

# Check PR status
gh pr status
```

### Updating PRs

```bash
# Add comment to PR
gh pr comment 45 --body "Updated implementation based on feedback"

# Merge PR
gh pr merge 45

# Merge and delete branch
gh pr merge 45 --delete-branch

# Merge with squash
gh pr merge 45 --squash

# Close PR without merging
gh pr close 45

# Mark draft PR as ready
gh pr ready 45
```

## Repository

### Viewing Repository Info

```bash
# View repository overview
gh repo view

# View repo in browser
gh repo view --web

# Get repo info as JSON
gh repo view --json name,owner,url,description
```

### Cloning & Forking

```bash
# Clone a repository
gh repo clone owner/repo

# Fork a repository
gh repo fork owner/repo

# Create new repository
gh repo create my-new-repo --public
```

## Projects (GitHub Projects v2)

**Note:** Projects require additional auth scopes. Run: `gh auth refresh -s read:project,write:project`

```bash
# List projects
gh project list

# View project
gh project view 1

# Add issue to project
gh project item-add 1 --owner username --url https://github.com/owner/repo/issues/123

# Update project item status
gh project item-edit --id ITEM_ID --field-id FIELD_ID --project-id 1 --text "In Progress"
```

## Workflows & Actions

```bash
# List workflow runs
gh run list

# View specific workflow run
gh run view 12345

# Watch a workflow run
gh run watch 12345

# Trigger a workflow
gh workflow run workflow-name.yml
```

## Labels

```bash
# List all labels
gh label list

# Create label
gh label create "prd-0006" --description "PRD 0006: Notification System" --color "0e8a16"

# Create common labels for this project
gh label create "feature" --description "New feature" --color "0e8a16"
gh label create "bug" --description "Something broken" --color "d73a4a"
gh label create "enhancement" --description "Improvement to existing feature" --color "a2eeef"
gh label create "blocked" --description "Waiting on something" --color "fbca04"
gh label create "needs-testing" --description "Implementation done, testing needed" --color "d4c5f9"
gh label create "in-progress" --description "Currently being worked on" --color "1d76db"

# Delete label
gh label delete "old-label"
```

## Searching

```bash
# Search issues
gh search issues "login bug" --repo owner/repo

# Search issues by label
gh search issues --label "prd-0006"

# Search code
gh search code "function authenticate"
```

## Useful Combinations

### Complete Feature Workflow

```bash
# 1. Create issue from PRD
gh issue create --title "PRD-0006: Notification System" \
  --body "$(cat tasks/0006-prd-notification-system.md)" \
  --label "feature,prd-0006"

# Note the issue number (e.g., #123)

# 2. Create branch
git checkout -b feature/123-notification-system

# ... do work, commit changes ...

# 3. Push branch
git push -u origin feature/123-notification-system

# 4. Create PR that closes issue
gh pr create --title "feat: implement notification system" \
  --body "Implements PRD-0006.

## Changes
- Notification component created
- Email integration
- In-app notifications

## Testing
- Unit tests: 95% coverage
- Integration tests passing

Closes #123"

# 5. Merge when ready
gh pr merge 123 --squash --delete-branch
```

### Update Issue with Progress

```bash
# Add progress update
ISSUE_NUM=123
COMMIT_HASH=$(git rev-parse --short HEAD)
BRANCH_NAME=$(git branch --show-current)

gh issue comment $ISSUE_NUM --body "✅ Task 2.0 Complete

**Completed:**
- User authentication flow
- Session management
- Tests added (88% coverage)

**Commit:** $COMMIT_HASH
**Branch:** $BRANCH_NAME

**Next:** Task 3.0 - Email integration"
```

### Check Project Status

```bash
# View all open issues with their labels
gh issue list --json number,title,labels --jq '.[] | "\(.number): \(.title) [\(.labels[].name | join(", "))]"'

# View all PRs with their status
gh pr list --json number,title,state,isDraft

# View recent activity
gh issue list --limit 5 --state all
gh pr list --limit 5 --state all
```

## Tips & Best Practices

1. **Use `--help` for any command:**
   ```bash
   gh issue create --help
   ```

2. **Use `--web` to quickly open things in browser:**
   ```bash
   gh issue view 123 --web
   gh pr view 45 --web
   gh repo view --web
   ```

3. **Use JSON output for scripting:**
   ```bash
   gh issue view 123 --json number,title,state,labels
   ```

4. **Reference issues in commits:**
   ```bash
   git commit -m "feat: add login form (#123)"
   ```

5. **Auto-close issues from PRs:**
   Include "Closes #123" or "Fixes #123" in PR description

6. **Use labels consistently:**
   - `prd-XXXX` for PRD tracking
   - `feature`, `bug`, `enhancement` for type
   - `in-progress`, `blocked`, `needs-testing` for status

7. **Create issue templates** for consistency:
   ```bash
   # In .github/ISSUE_TEMPLATE/
   ```

## Common Issues & Solutions

### "Resource not accessible by integration"
- Need to refresh auth: `gh auth refresh -s read:project,write:project`

### "Could not resolve to a Repository"
- Make sure you're in the repo directory
- Check remote: `git remote -v`

### Commands not working
- Update gh: `brew upgrade gh` (macOS) or check gh docs
- Re-authenticate: `gh auth login`

## Further Reading

- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub CLI Repository](https://github.com/cli/cli)
- [gh issue documentation](https://cli.github.com/manual/gh_issue)
- [gh pr documentation](https://cli.github.com/manual/gh_pr)
