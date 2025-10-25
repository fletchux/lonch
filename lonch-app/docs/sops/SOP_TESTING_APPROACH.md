# SOP: Testing Philosophy & Approach

**Purpose:** Define our testing standards and ensure consistent, high-quality test coverage.

**When to use:** Every time you write code. No exceptions.

**Time:** Tests should take ~30% of development time (worth it!)

---

## 📋 TL;DR

```
1. All tests MUST pass before committing (100% pass rate)
2. Write tests BEFORE code (TDD) whenever possible
3. Test behavior, not implementation
4. Manual testing is still required for UX
5. No skipped tests, no commented-out tests, no "flaky" tests
```

**Golden Rule:** If tests are failing, your ONLY job is to fix them. Everything else stops.

---

## 🎯 Our Testing Standards

### Non-Negotiable Requirements

**✅ Before ANY commit:**
- [ ] `npm test` shows **100% passing** (not 99%, not "just one flaky test")
- [ ] `npx eslint .` shows **zero errors**
- [ ] Manual testing completed for user-facing changes
- [ ] No console.log or debugging code left behind

**Current project status:**
```bash
npm test
# ✅ Test Files 38 passed (38)
# ✅ Tests 648 passed (648)
```

**This number only goes UP, never down!**

---

## 🧪 Types of Tests

### 1. Unit Tests
**What:** Test individual functions/components in isolation

**When:** Every service function, every utility function

**Example:**
```javascript
// src/services/inviteLinkService.test.js
describe('generateInviteLink', () => {
  it('should create invite link in Firestore with correct fields', async () => {
    const link = await generateInviteLink('project-123', 'viewer', 'client', 'user-123');

    expect(link).toHaveProperty('id');
    expect(link).toHaveProperty('token');
    expect(link.role).toBe('viewer');
    expect(link.group).toBe('client');
    expect(link.projectId).toBe('project-123');
  });
});
```

**📚 Junior Dev Note:**
Unit tests are like testing individual Lego bricks before building. Each piece must work alone before combining them.

### 2. Component Tests
**What:** Test React components render correctly and handle interactions

**When:** Every UI component

**Example:**
```javascript
// src/components/project/GenerateLinkModal.test.jsx
it('should render modal with title', () => {
  render(<GenerateLinkModal projectId="123" onClose={mockFn} />);

  expect(screen.getByText('Generate Shareable Invite Link')).toBeInTheDocument();
});

it('should call onClose when Cancel is clicked', () => {
  render(<GenerateLinkModal projectId="123" onClose={mockOnClose} />);

  fireEvent.click(screen.getByText('Cancel'));

  expect(mockOnClose).toHaveBeenCalledTimes(1);
});
```

### 3. Integration Tests
**What:** Test multiple components/services working together

**When:** Critical user flows

**Example:**
```javascript
it('should complete full invite link flow', async () => {
  // 1. Generate link
  const link = await generateInviteLink('project-123', 'viewer', 'client', 'user-123');

  // 2. Accept link
  await acceptInviteLink(link.token, 'user-456');

  // 3. Verify user is member
  const member = await getProjectMember('project-123', 'user-456');
  expect(member).toBeDefined();
  expect(member.role).toBe('viewer');
});
```

### 4. Manual Testing
**What:** Human testing of actual user experience

**When:** After any UI change, before marking feature complete

**Checklist example:**
```markdown
Feature: Generate Invite Link

- [ ] Open modal by clicking "+ Generate Link"
- [ ] Select each role (owner, admin, editor, viewer)
- [ ] Select each group (consulting, client)
- [ ] Click Generate Link
- [ ] See generated link in modal
- [ ] Copy link to clipboard works
- [ ] Click Done closes modal
- [ ] Link appears in table
- [ ] Activity log shows creation
```

---

## ✍️ Test-Driven Development (TDD)

### The Red-Green-Refactor Cycle

**1. 🔴 RED: Write failing test**
```javascript
it('should disable button while loading', () => {
  render(<MyComponent />);
  fireEvent.click(screen.getByRole('button'));

  expect(screen.getByRole('button')).toBeDisabled();  // ❌ FAILS
});
```

**2. 🟢 GREEN: Write minimal code to pass**
```javascript
function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    // ... do async work
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      Click Me
    </button>
  );
}
```

**3. 🔵 REFACTOR: Clean up (tests still pass)**
```javascript
// Extract hook
function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  // ...
  return { loading, execute };
}

// Cleaner component
function MyComponent() {
  const { loading, execute } = useAsyncAction();
  return <button onClick={execute} disabled={loading}>Click Me</button>;
}
```

### When to Use TDD

**✅ Always use for:**
- Bug fixes (write test that reproduces bug first!)
- New service functions (test before implementation)
- Complex logic (tests help you think through edge cases)

**⚡ Optional for:**
- Simple UI components (can write tests after)
- Refactoring (tests already exist)

---

## 📝 Writing Good Tests

### DO ✅

**1. Test behavior, not implementation**
```javascript
// ✅ GOOD: Tests what user experiences
it('should show error message when email is invalid', () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid' } });
  fireEvent.click(screen.getByText('Submit'));

  expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
});

// ❌ BAD: Tests internal state
it('should set emailError state to true', () => {
  const wrapper = mount(<LoginForm />);
  wrapper.instance().setState({ email: 'invalid' });

  expect(wrapper.state('emailError')).toBe(true);
});
```

**2. Use descriptive test names**
```javascript
// ✅ GOOD: Describes behavior clearly
it('should disable Generate button while link is being created')
it('should show success message after link generation completes')
it('should call onLinkGenerated callback when user clicks Done button')

// ❌ BAD: Vague or technical jargon
it('should work correctly')
it('test button')
it('handleClick function')
```

**3. Arrange-Act-Assert (AAA) pattern**
```javascript
it('should add member to project', async () => {
  // ARRANGE: Set up test data
  const projectId = 'project-123';
  const userId = 'user-456';
  const role = 'editor';

  // ACT: Perform the action
  await addProjectMember(projectId, userId, role);

  // ASSERT: Verify the result
  const member = await getProjectMember(projectId, userId);
  expect(member.role).toBe('editor');
});
```

### DON'T ❌

**1. Don't test library code**
```javascript
// ❌ BAD: Testing React itself
it('should call useState', () => {
  // Don't test that React's useState works!
});

// ✅ GOOD: Test YOUR code
it('should update input value when user types', () => {
  // Test your component's behavior
});
```

**2. Don't test implementation details**
```javascript
// ❌ BAD: Tests how it works internally
it('should call fetchProjects function', () => {
  expect(mockFetchProjects).toHaveBeenCalled();
});

// ✅ GOOD: Tests what user sees
it('should display list of projects after loading', async () => {
  render(<Home />);

  await waitFor(() => {
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });
});
```

**3. Don't write flaky tests**
```javascript
// ❌ BAD: Timing-dependent, sometimes fails
it('should show notification', () => {
  showNotification('Hello');
  expect(screen.getByText('Hello')).toBeInTheDocument();  // Might not appear yet!
});

// ✅ GOOD: Waits for element
it('should show notification', async () => {
  showNotification('Hello');
  await waitFor(() => {
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## 🚫 Banned Practices

### 1. Skipping Tests
```javascript
// ❌ ABSOLUTELY FORBIDDEN
it.skip('should do something', () => {
  // This test is broken so I'll just skip it
});

describe.skip('Broken feature', () => {
  // I'll fix these tests later (narrator: they won't)
});
```

**If a test is failing:**
- Fix it immediately
- Or delete it (if it's testing wrong thing)
- NEVER skip it

### 2. Commenting Out Tests
```javascript
// ❌ FORBIDDEN
// it('should work', () => {
//   // Commented out because it fails
// });
```

**Why:** Creates clutter, forgotten, hides problems

### 3. Lowering Standards to Pass
```javascript
// ❌ BAD: Changed test to match broken code
it('should close modal', () => {
  // Used to expect modal to stay open, but it closes now
  // So I changed the test to expect it to close
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

**Why:** Tests should define correct behavior. If behavior changes, ask "is this a bug or intended?"

### 4. Committing with Failing Tests
```bash
$ npm test
❌ Test Files  1 failed (38)
   Tests  1 failed | 647 passed (648)

$ git commit -m "will fix tests later"  # ❌ NO! BAD! STOP!
```

**Consequences:**
- Breaks CI/CD
- Blocks other developers
- Reputation damage
- Tests rot (broken window theory)

---

## 🎯 Running Tests

### During Development

**Watch mode (auto-runs on file change):**
```bash
npm test
```

**Single test file:**
```bash
npm test -- src/services/emailService.test.js
```

**Specific test:**
```bash
npm test -- -t "should send invitation email"
```

**With coverage:**
```bash
npm run test:coverage
```

### Before Committing

**Full test suite (required):**
```bash
npm test
```

**Must see:**
```
✅ Test Files  38 passed (38)
✅ Tests  648 passed (648)
```

**ESLint (required):**
```bash
npx eslint .
```

**Must see:**
```
(no output = success)
```

---

## 📊 Coverage Goals

**Current coverage:**
```
Statements   : 85%
Branches     : 78%
Functions    : 82%
Lines        : 85%
```

**Goals:**
- **Critical paths:** 100% (auth, payments, data loss scenarios)
- **Services:** 90%+ (business logic must be tested)
- **Components:** 80%+ (UI is harder to test, focus on interactions)
- **Utilities:** 100% (pure functions are easy to test)

**📚 Junior Dev Note:**
Coverage percentage is helpful but not the goal. You can have 100% coverage with bad tests! Focus on testing real user scenarios.

---

## 🐛 When Tests Fail

### Step 1: Read the Error Message

```bash
❌ FAIL src/components/project/GenerateLinkModal.test.jsx
  ● should NOT close modal immediately after link generation

    expect(jest.fn()).not.toHaveBeenCalled()

    Expected number of calls: 0
    Received number of calls: 1

      101 |   });
      102 |
    > 103 |   expect(mockOnLinkGenerated).not.toHaveBeenCalled();
          |                               ^
      104 | });
```

**What this tells us:**
- Which test failed: "should NOT close modal immediately"
- What failed: `mockOnLinkGenerated` was called (but shouldn't be)
- Where: Line 103 of the test file
- The problem: Callback firing when it shouldn't

### Step 2: Reproduce Manually

Can you make it fail the same way by using the app?
- Yes → It's a real bug (good catch, tests!)
- No → Test might be wrong

### Step 3: Fix or Delete

**Fix the code if:**
- Test is correct
- Code is wrong
- This is expected behavior

**Fix the test if:**
- Test assumptions are wrong
- Requirements changed
- Test is flaky (timing issues, etc.)

**Delete the test if:**
- Testing wrong thing entirely
- Duplicate of another test
- Feature was removed

**📚 Junior Dev Note:**
Don't assume the test is wrong just because it fails. Tests are often smarter than we give them credit for - they catch things we miss!

---

## ✅ Checklist: Before Committing

**Automated tests:**
- [ ] `npm test` runs successfully
- [ ] ALL tests pass (100%)
- [ ] `npx eslint .` shows zero errors
- [ ] No console.log statements left
- [ ] No debugging code (debugger, comments, etc.)
- [ ] No skipped tests (it.skip, describe.skip)
- [ ] No commented-out tests

**Manual testing (for UI changes):**
- [ ] Tested happy path (expected usage)
- [ ] Tested error cases (invalid input, etc.)
- [ ] Tested edge cases (empty states, max values, etc.)
- [ ] Tested on different screen sizes (if applicable)
- [ ] Tested keyboard navigation (if applicable)
- [ ] No console errors in browser

---

## 📚 Related Documentation

- **Bug Fixing:** [Bug Fixing SOP](SOP_BUG_FIXING.md) - TDD for bugs
- **Features:** [PRD Workflow SOP](SOP_PRD_WORKFLOW.md) - testing new features
- **Quality:** [Git Conventions SOP](SOP_GIT_WORKFLOW.md) - commit standards
- **Overview:** [AI Development Guide](../AI_DEVELOPMENT_GUIDE.md) - the big picture

---

## 📖 Testing Resources

**Project examples:**
- Good test file: `src/components/project/GenerateLinkModal.test.jsx`
- Service tests: `src/services/inviteLinkService.test.js`
- Utility tests: `src/utils/permissions.test.js`

**Documentation:**
- [Vitest](https://vitest.dev/) - Our test runner
- [React Testing Library](https://testing-library.com/react) - Component testing
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** 2025-10-24

**Questions?** Ask in team chat or check existing test files for examples.
