# 🤖 AI-Assisted Development Guide for Lonch

Welcome to the Lonch development team! This guide will help you understand how we use AI (specifically Claude Code) to build features, fix bugs, and maintain high code quality.

## 📚 Why We Work This Way

At Lonch, we embrace AI as a powerful development partner. Think of Claude Code as an experienced pair programmer who:
- Never gets tired or impatient
- Remembers every detail of your codebase
- Writes tests before code (TDD advocate!)
- Documents everything thoroughly
- Follows conventions consistently

**But here's the key:** AI is a tool, not a replacement for developer judgment. You're still the architect, product thinker, and final decision-maker.

## 🎯 Quick Navigation

Choose your workflow based on what you're doing:

| What are you doing? | Use this SOP | Why? |
|---------------------|--------------|------|
| Building a new feature | [PRD Workflow](sops/SOP_PRD_WORKFLOW.md) | Structured approach ensures nothing is missed |
| Fixing a bug | [Bug Fixing Workflow](sops/SOP_BUG_FIXING.md) | Document → Test → Fix → Verify pattern |
| Writing/running tests | [Testing Philosophy](sops/SOP_TESTING_APPROACH.md) | Our quality standards and expectations |
| Committing code | [Git Conventions](sops/SOP_GIT_WORKFLOW.md) | Keep history clean and meaningful |

## 🚀 Quick Wins: Common Tasks

### "I need to add a new feature"
```
1. Read: docs/sops/SOP_PRD_WORKFLOW.md
2. Run: create-prd workflow
3. Follow the generated task list
```

### "I found a bug"
```
1. Read: docs/sops/SOP_BUG_FIXING.md
2. Say to Claude: "fixit"
3. Follow the conversational flow
```

### "Tests are failing"
```
1. Read: docs/sops/SOP_TESTING_APPROACH.md
2. Never skip failing tests - fix them or ask for help
3. Run: npm test
```

### "Ready to commit"
```
1. Read: docs/sops/SOP_GIT_WORKFLOW.md
2. Ensure all tests pass first
3. Use descriptive commit messages
```

## 🛠️ Essential Tools

### Claude Code
Your AI pair programmer. Access via:
- CLI: `claude` command
- Features:
  - Code reading/writing
  - Test generation
  - Bug analysis
  - Documentation

### Workflows
Pre-built automation scripts in `.claude/workflows/`:
- `create-prd.md` - Generate Product Requirement Documents
- `generate-tasks.md` - Break PRDs into task lists
- `process-task-list.md` - Execute tasks step-by-step

**When to use workflows:** Structured, multi-step processes (new features, complex changes)

### Slash Commands
Quick commands for common tasks:
- Coming soon (you can add your own in `.claude/commands/`)

**When to use slash commands:** Quick, repeatable actions

### Conversational Development
Just talk to Claude naturally:
- "fixit" - Start bug fixing workflow
- "Can you explain how the permissions system works?"
- "Help me write tests for the invite link feature"

**When to use conversation:** Exploration, learning, ad-hoc tasks

## 🎓 For Junior Developers

**Don't skip this section!** Here's what makes our AI-assisted approach different:

### 1. AI Writes Tests First
Unlike traditional development, we often let Claude write failing tests before implementation. This is **Test-Driven Development (TDD)**:
```
Traditional: Write code → Write tests → Hope they pass
Our way: Write tests → Watch them fail → Write code → Tests pass ✅
```

**Why?** Tests written first are better at catching bugs because they're written based on requirements, not implementation.

### 2. Documentation is Not Optional
Every bug gets a detailed report. Every feature gets a PRD. Why?
- **Knowledge transfer:** Your future self will thank you
- **Debugging:** "When did this break and why?"
- **Collaboration:** Others can pick up where you left off
- **Learning:** Review old reports to see patterns

### 3. Commit Messages Matter
Good commit message:
```
Fix: Projects not appearing in dashboard after invite acceptance

Root Cause: Projects were only fetched when currentUser changed
Solution: Extracted fetchProjects and called it after invite acceptance

Closes #16
```

Bad commit message:
```
fixed bug
```

**Why?** Git history is a story of your codebase. Make it readable.

### 4. All Tests Must Pass
**No exceptions.** If you see this:
```
Tests: 647 passed, 1 failed
```

You have **only one option:** Fix the failing test. Don't:
- ❌ Skip it
- ❌ Comment it out
- ❌ "I'll fix it later"
- ❌ "It's just a flaky test"

**Why?** One failing test becomes five, then ten. Broken windows theory.

## 💡 For Experienced Developers

**TL;DR section for you:**

### Key Differences from Traditional Development

1. **Let AI handle boilerplate:** Don't manually write repetitive code
2. **Use workflows for structure:** PRD → Tasks → Implementation is enforced
3. **Documentation is automated:** Bug reports, commit messages, etc. are templated
4. **Tests are non-negotiable:** 100% pass rate, always
5. **Conversational debugging:** Describe the problem, Claude investigates

### Power User Tips

**Workflow Customization:**
- Edit `.claude/workflows/*.md` to match your team's needs
- Add custom slash commands in `.claude/commands/`

**Effective Prompting:**
```
❌ "Fix this"
✅ "The modal closes immediately after clicking Generate. It should stay open to show the link. Can you investigate?"
```

**Context Management:**
- Claude can read entire files - give file paths
- Use `Read` tool results to verify Claude's understanding
- If confused, ask Claude to read the relevant files first

**Multi-file Changes:**
- Trust Claude to handle multiple related files
- Review the diff before committing
- Ask "What files did you change and why?" for clarity

## 📊 Quality Standards

### Must-Have Before Any Commit

- [ ] **All tests passing** - `npm test` shows 100% pass rate
- [ ] **ESLint clean** - `npx eslint .` shows no errors
- [ ] **Code reviewed** - Either by AI or human (or both)
- [ ] **Documented** - Bug report, PRD, or clear commit message
- [ ] **Manually tested** - For user-facing changes

### Nice-to-Have (But Encouraged)

- [ ] Test coverage increased or maintained
- [ ] No console.log debugging statements left behind
- [ ] Updated README if feature affects setup
- [ ] Screenshots for UI changes

## 🔄 The Lonch Development Cycle

```
1. PLAN
   ├─ Feature? → Create PRD (workflow)
   └─ Bug? → Say "fixit" (conversational)

2. DEVELOP
   ├─ Write tests first (TDD)
   ├─ Implement code
   └─ Verify tests pass

3. VERIFY
   ├─ Run full test suite
   ├─ Run ESLint
   └─ Manual testing

4. DOCUMENT
   ├─ Bug report or PRD already exists
   ├─ Update with solution
   └─ Write descriptive commit message

5. COMMIT
   ├─ Review changes
   ├─ Create meaningful commit
   └─ Push to branch

6. REVIEW
   ├─ Create PR
   ├─ Code review (human or AI)
   └─ Merge to main
```

## 🎯 Real-World Examples

### Example 1: Adding Share Links Feature (PRD Workflow)
**Situation:** Product wants users to generate shareable invite links

**What we did:**
1. Created PRD: `specs/0004-prd-shareable-invite-links.md`
2. Generated tasks: `specs/tasks-0004-prd-shareable-invite-links.md`
3. Processed tasks one-by-one with Claude
4. Result: 648 tests passing, feature complete

**Time saved:** ~40% vs. traditional development (no context switching, consistent quality)

**See:** [SOP: PRD Workflow](sops/SOP_PRD_WORKFLOW.md) for details

### Example 2: Fixing Modal Bug (Bug Workflow)
**Situation:** Modal closes immediately after generating link

**What we did:**
1. Said "fixit" to Claude
2. Described the problem conversationally
3. Claude created bug report: `bugs/2025-10-24-generate-link-modal-closes-immediately.md`
4. Wrote failing test
5. Fixed the bug
6. Verified fix

**Time saved:** ~60% vs. traditional debugging (AI spotted root cause instantly)

**See:** [SOP: Bug Fixing Workflow](sops/SOP_BUG_FIXING.md) for details

## 🤝 Collaboration with AI

### Do's ✅
- **Be specific:** "The button on line 42 doesn't trigger the modal"
- **Provide context:** Share file paths, error messages, expected behavior
- **Ask for explanations:** "Why did you choose this approach?"
- **Review AI output:** Don't blindly accept - verify and understand
- **Iterate:** If first attempt isn't right, explain what's wrong

### Don'ts ❌
- **Don't be vague:** "Make it better" (better how?)
- **Don't skip testing:** Manual testing catches what tests miss
- **Don't ignore warnings:** If Claude says "this might break X", investigate
- **Don't commit without review:** Read the diff, understand the changes
- **Don't work in isolation:** Ask questions, collaborate

## 📖 Learning Resources

### Internal Documentation
- [PRD Workflow SOP](sops/SOP_PRD_WORKFLOW.md) - Feature development process
- [Bug Fixing SOP](sops/SOP_BUG_FIXING.md) - Debugging and fixing issues
- [Testing Philosophy SOP](sops/SOP_TESTING_APPROACH.md) - Quality standards
- [Git Conventions SOP](sops/SOP_GIT_WORKFLOW.md) - Version control practices

### Existing Project Docs
- [README.md](../README.md) - Project setup and overview
- [Firebase Email Setup](FIREBASE_EMAIL_SETUP.md) - Manual config guide
- [Feature Complete](../FEATURE_COMPLETE.md) - Completed features list
- [Test Coverage](../TEST_COVERAGE.md) - Testing metrics

### Examples to Study
- **Good PRD:** `specs/0004-prd-shareable-invite-links.md`
- **Good Bug Report:** `bugs/2025-10-24-generate-link-modal-closes-immediately.md`
- **Good Tests:** `src/components/project/GenerateLinkModal.test.jsx`
- **Good Commit:** Search git log for "Fix: Projects not appearing in dashboard"

## 🎨 Making It Enjoyable

Development should be fun! Here's how we keep it that way:

### Celebrate Wins 🎉
- All tests passing? That's a win.
- Fixed a gnarly bug? Document it proudly.
- Shipped a feature? Update FEATURE_COMPLETE.md

### Learn Something New 📚
- Ask Claude to explain code you don't understand
- Review PRDs from complex features
- Read bug reports to see debugging techniques

### Stay Curious 🔍
- Experiment with different prompts
- Try workflow customization
- Suggest improvements to these SOPs

### Take Breaks 🧘
- AI is patient - you don't have to rush
- Step away when stuck
- Come back with fresh eyes (or ask a teammate)

## 🚦 When to Ask for Help

**Ask Claude when:**
- Understanding existing code
- Writing tests
- Debugging errors
- Generating boilerplate
- Refactoring

**Ask a human when:**
- Architecture decisions
- Product direction
- Performance optimization strategy
- Security concerns
- You've tried with Claude 3+ times and still stuck

**Ask both when:**
- Learning new patterns
- Code review
- Complex refactoring
- Critical bug fixes

## 🎯 Getting Started Checklist

New to the team? Complete these in order:

- [ ] Read this entire guide (yes, all of it!)
- [ ] Read all 4 detailed SOPs (links above)
- [ ] Clone the repo and run `npm install`
- [ ] Run `npm test` - see all 648 tests pass
- [ ] Run `npm run dev` - explore the app
- [ ] Say "fixit" to Claude and describe a hypothetical bug (practice)
- [ ] Read a real bug report from `bugs/` folder
- [ ] Read a real PRD from `specs/` folder
- [ ] Pick an open GitHub issue and fix it (with Claude's help)
- [ ] Create your first PR using our Git conventions

## 📞 Questions?

**About workflows/tools:**
- Read the relevant SOP first
- Try it with Claude
- Ask team in chat if still unclear

**About the codebase:**
- Ask Claude: "Can you explain how [feature] works?"
- Read the relevant files
- Check PRDs in `specs/` folder

**About process:**
- These docs are living - suggest improvements!
- Open an issue if something is unclear
- Update docs when you find better ways

---

## 🎓 Appendix: Glossary

**For Junior Developers** - Quick reference for terms used in our SOPs:

- **PRD:** Product Requirements Document - detailed description of a feature
- **TDD:** Test-Driven Development - write tests before code
- **SOP:** Standard Operating Procedure - how we do things here
- **Workflow:** Automated multi-step process (in `.claude/workflows/`)
- **Slash Command:** Quick command starting with `/` (in `.claude/commands/`)
- **Root Cause:** The underlying reason a bug exists (not just the symptom)
- **Regression:** When a fix for one bug breaks something else
- **Edge Case:** Unusual scenario that might break your code
- **Refactor:** Improving code structure without changing behavior
- **Idempotent:** Running something multiple times has same effect as once

---

**Last Updated:** 2025-10-24

**Maintainers:** Development Team

**Feedback:** Open an issue or PR to improve these docs!
