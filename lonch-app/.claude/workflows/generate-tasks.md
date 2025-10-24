# Rule: Generating a Task List from a PRD

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format based on an existing Product Requirements Document (PRD). The task list should guide a developer through implementation.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/specs/`
- **Filename:** `tasks-[prd-file-name].md` (e.g., `tasks-0001-prd-user-profile-editing.md`)

## Process

1.  **Receive PRD Reference:** The user points the AI to a specific PRD file
2.  **Analyze PRD:** The AI reads and analyzes the functional requirements, user stories, and other sections of the specified PRD. Think hard.
3.  **Assess Current State:** Review the existing codebase to understand existing infrastructure, architectural patterns and conventions. Also, identify any existing components or features that already exist and could be relevant to the PRD requirements. Then, identify existing related files, components, and utilities that can be leveraged or need modification. Think hard.
4.  **Phase 1: Generate Parent Tasks:** Based on the PRD analysis and current state assessment, create the file and generate the main, high-level tasks required to implement the feature. Use your judgement on how many high-level tasks to use. It's likely to be about five tasks. **Include a testing task as one of the parent tasks.** Present these tasks to the user in the specified format (without sub-tasks yet). Inform the user: "I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed."
5.  **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
6.  **Phase 2: Generate Sub-Tasks with TDD:** Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete the parent task. **For implementation tasks, structure sub-tasks to follow TDD:**
    - Write test(s) for the feature/function
    - Implement the feature/function
    - Verify tests pass

    Ensure sub-tasks logically follow from the parent task, cover the implementation details implied by the PRD, and consider existing codebase patterns where relevant without being constrained by them. Think hard.
7.  **Identify Relevant Files:** Based on the tasks and PRD, identify potential files that will need to be created or modified. Think hard. **Always include test files for each implementation file.** List these under the `Relevant Files` section.
8.  **Create GitHub Issue:** After generating the task list, create a GitHub issue for this PRD:
    ```bash
    gh issue create --title "PRD-XXXX: Feature Name" \
      --body "$(cat specs/XXXX-prd-feature-name.md)" \
      --label "feature,prd-XXXX"
    ```
    Add the issue number to the task file header.
9.  **Generate Final Output:** Combine the parent tasks, sub-tasks, relevant files, GitHub issue reference, and notes into the final Markdown structure.
10. **Save Task List:** Save the generated document in the `/specs/` directory with the filename `tasks-[prd-file-name].md`, where `[prd-file-name]` matches the base name of the input PRD file (e.g., if the input was `0001-prd-user-profile-editing.md`, the output is `tasks-0001-prd-user-profile-editing.md`).

## Output Format

The generated task list _must_ follow this structure:

```markdown
# Task List: PRD-XXXX Feature Name

**GitHub Issue:** #XX
**PRD:** specs/XXXX-prd-feature-name.md
**Status:** Not Started

## Relevant Files

- `path/to/potential/file1.ts` - Brief description of why this file is relevant (e.g., Contains the main component for this feature).
- `path/to/file1.test.ts` - Unit tests for `file1.ts` (REQUIRED for TDD).
- `path/to/another/file.tsx` - Brief description (e.g., API route handler for data submission).
- `path/to/another/file.test.tsx` - Unit tests for `another/file.tsx` (REQUIRED for TDD).
- `lib/utils/helpers.ts` - Brief description (e.g., Utility functions needed for calculations).
- `lib/utils/helpers.test.ts` - Unit tests for `helpers.ts` (REQUIRED for TDD).

### Notes

- **TDD Required:** Write tests BEFORE implementing features. Follow RED-GREEN-REFACTOR cycle.
- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npm test` to run all tests. Use `npm test -- path/to/test/file` to run specific tests.
- Test coverage should be >80% for new code. Check with `npm run test:coverage`.

## Tasks

- [ ] 1.0 Parent Task Title
  - [ ] 1.1 Write test(s) for [specific feature]
  - [ ] 1.2 Implement [specific feature]
  - [ ] 1.3 Verify tests pass and refactor if needed
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 Write test(s) for [another feature]
  - [ ] 2.2 Implement [another feature]
  - [ ] 2.3 Verify tests pass
- [ ] 3.0 Testing & Integration
  - [ ] 3.1 Run full test suite and verify all tests pass
  - [ ] 3.2 Check test coverage meets requirements (>80%)
  - [ ] 3.3 Integration testing with existing features
```

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate the detailed sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

## Target Audience

Assume the primary reader of the task list is a **junior developer** who will implement the feature with awareness of the existing codebase context.
