# Task List Management

Guidelines for managing task lists in markdown files to track progress on completing a PRD

## Test-Driven Development (TDD) Approach

**This project follows TDD principles. Write tests BEFORE implementing features.**

### TDD Cycle for Each Sub-Task

1. **Write the test first**
   - Define the expected behavior in a test
   - Test should fail initially (RED phase)
   - Verify the test fails for the right reason

2. **Implement the minimum code to pass**
   - Write just enough code to make the test pass (GREEN phase)
   - Don't over-engineer or add extra features

3. **Refactor**
   - Clean up the code while tests protect you (REFACTOR phase)
   - Improve structure, readability, performance
   - Tests should still pass

4. **Verify & Complete**
   - Run full test suite to ensure no regressions
   - Mark sub-task complete only when tests pass

### Test Requirements

- **Every new function/component MUST have tests**
- **Test coverage:** Aim for >80% coverage on new code
- **Test types needed:**
  - Unit tests for individual functions
  - Integration tests for component interactions
  - Edge case tests (null, undefined, empty, extreme values)
  - Error handling tests
- **Tests must pass before marking sub-task complete**

## Task Implementation

- **One sub-task at a time:** Do **NOT** start the next sub‑task until you ask the user for permission and they say "yes" or "y"

- **TDD Protocol for Each Sub-Task:**
  1. **Write test(s)** for the feature/function
  2. **Run test** - should FAIL (confirm test is valid)
  3. **Implement** the feature/function
  4. **Run test** - should PASS
  5. **Refactor** if needed (tests still passing)
  6. **Mark sub-task complete** `[ ]` → `[x]`

- **Completion protocol:**
  1. When you finish a **sub‑task**, immediately mark it as completed by changing `[ ]` to `[x]`.
  2. If **all** subtasks underneath a parent task are now `[x]`, follow this sequence:
    - **First**: Run the full test suite (`npm test`, `pytest`, etc.)
    - **Check coverage**: Verify test coverage meets requirements (`npm run test:coverage`)
    - **Only if all tests pass**: Stage changes (`git add .`)
    - **Clean up**: Remove any temporary files and temporary code before committing
    - **Commit**: Use a descriptive commit message that:
      - Uses conventional commit format (`feat:`, `fix:`, `refactor:`, `test:`, etc.)
      - Summarizes what was accomplished in the parent task
      - Lists key changes and additions
      - Includes test coverage info
      - References the task number, PRD context, and GitHub issue
      - **Formats the message as a single-line command using `-m` flags**, e.g.:

        ```
        git commit -m "feat: add payment validation logic (#45)" -m "- Validates card type and expiry" -m "- Adds unit tests for edge cases" -m "- Test coverage: 92%" -m "Related to Task 2.0 in PRD-0006"
        ```
  3. Once all the subtasks are marked completed and changes have been committed, mark the **parent task** as completed.
- Stop after each sub‑task and wait for the user's go‑ahead.

## Task List Maintenance

1. **Update the task list as you work:**
   - Mark tasks and subtasks as completed (`[x]`) per the protocol above.
   - Add new tasks as they emerge.

2. **Maintain the "Relevant Files" section:**
   - List every file created or modified.
   - Give each file a one‑line description of its purpose.

## AI Instructions

When working with task lists, the AI must:

1. Regularly update the task list file after finishing any significant work.
2. Follow the completion protocol:
   - Mark each finished **sub‑task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.
3. Add newly discovered tasks.
4. Keep "Relevant Files" accurate and up to date.
5. Before starting work, check which sub‑task is next.
6. After implementing a sub‑task, update the file and then pause for user approval.