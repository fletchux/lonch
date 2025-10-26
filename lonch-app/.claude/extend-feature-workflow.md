# Extend Feature Workflow

**Purpose:** Improve or enhance an existing feature's UX, behavior, or capabilities without fixing bugs or adding entirely new features.

**When to Use:**
- Improving UX of existing features
- Refining user interactions
- Optimizing existing workflows
- Extending feature capabilities within its current scope
- Making existing features more robust or user-friendly

**When NOT to Use:**
- Fixing bugs → Use `fixit-workflow.md`
- Building new features → Use `shazam-workflow.md`
- Simple refactoring without user-facing changes → Use `improve/<description>` branch directly

---

## Workflow Steps

### Step 1: Create Feature Enhancement Branch

**CRITICAL: Always create a branch first!**

```bash
git checkout main
git pull
git checkout -b feature/improve-<feature-name>
```

**Branch Naming Convention:**
- Pattern: `feature/improve-<feature-name>`
- Examples:
  - `feature/improve-document-list-ux`
  - `feature/improve-invite-flow`
  - `feature/improve-navigation`

### Step 2: Plan the Enhancement

Create a checklist of improvements to make:
1. List all changes needed
2. Identify dependencies between changes
3. Plan order of implementation (independent changes first)
4. Estimate time for each change

**Use TodoWrite tool to track progress:**
```javascript
TodoWrite({
  todos: [
    { content: "Change 1: Description", status: "pending", activeForm: "Changing..." },
    { content: "Change 2: Description", status: "pending", activeForm: "Changing..." },
    // ... etc
  ]
})
```

### Step 3: Implement Changes Incrementally

**Pattern: Change → Test → Commit**

For each improvement:

1. **Make the change**
   - Edit relevant files
   - Update related components/utilities

2. **Update tests**
   - Fix any broken tests
   - Add new tests if needed

3. **Run tests**
   ```bash
   npm test
   ```

4. **Commit**
   ```bash
   git add <files>
   git commit -m "feat: descriptive commit message

   Detailed explanation of what changed and why.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

5. **Update todo** (mark current as completed, next as in_progress)

### Step 4: Final Verification

Before creating PR:

1. **Run full test suite**
   ```bash
   npm test
   ```

2. **Run linter**
   ```bash
   npm run lint
   ```

3. **Run build**
   ```bash
   npm run build
   ```

4. **Manual testing**
   - Test all changes in browser
   - Check responsive design at different screen sizes
   - Verify interactions work as expected

### Step 5: Create Pull Request

```bash
git push -u origin feature/improve-<feature-name>
gh pr create --title "feat: Brief description" --body "$(cat <<'EOF'
## Summary
[Brief overview of improvements made]

## Changes
- Change 1: Description
- Change 2: Description
- Change 3: Description

## Testing
- ✅ All tests passing (XXX/XXX)
- ✅ Manual testing complete
- ✅ Responsive design verified

## Screenshots (if applicable)
[Add before/after screenshots]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Design Patterns & Standards

### Destructive Action Protection Pattern

**When to use:** Any action that permanently deletes or modifies data

**Required Elements:**
1. **Modal confirmation dialog**
2. **Checkbox confirmation** - User must actively check
   ```
   ☐ I confirm I want to [delete/remove/etc] [X item(s)]
   ```
3. **Two buttons:**
   - Cancel button (safe action, can be default/enter key)
   - Destructive action button (red, requires checkbox to enable)
4. **NO pre-selected options** - User must make conscious choice

**Example Implementation:**
```jsx
<Modal>
  <h3>Confirm Deletion</h3>
  <p>Are you sure you want to delete {count} document(s)?</p>

  <label>
    <input
      type="checkbox"
      checked={confirmed}
      onChange={(e) => setConfirmed(e.target.checked)}
    />
    I confirm I want to delete {count} document(s)
  </label>

  <div className="actions">
    <button onClick={onCancel}>Cancel</button>
    <button
      onClick={onDelete}
      disabled={!confirmed}
      className="destructive"
    >
      Delete
    </button>
  </div>
</Modal>
```

### Bulk Actions Pattern

**When to use:** Actions that apply to multiple selected items

**UI Pattern:**
1. Checkboxes for each row
2. "Select all" checkbox in header
3. Action bar appears when items selected
4. Shows count: "X items selected"
5. Available actions displayed as icons/buttons
6. Destructive actions use confirmation pattern above

---

## Commit Message Guidelines

**Format:**
```
feat: Brief one-line description

Longer explanation of what changed and why. Include:
- What was the UX problem?
- How does this improve it?
- Any breaking changes or migration notes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New capability or improvement
- `refactor:` - Code improvement without behavior change
- `perf:` - Performance improvement
- `style:` - UI/styling changes

---

## Tips & Best Practices

1. **Make changes incrementally** - Easier to review and debug
2. **Test after each change** - Catch issues early
3. **Keep commits focused** - One logical change per commit
4. **Update tests as you go** - Don't leave them all for the end
5. **Consider backwards compatibility** - Will this break existing usage?
6. **Document user-facing changes** - Update relevant docs
7. **Think about edge cases** - What if list is empty? What if 1 item? 100 items?

---

## Example Session

```
User: "The document list needs better UX"