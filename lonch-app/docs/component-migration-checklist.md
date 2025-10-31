# Component Migration Checklist

Use this checklist for each component migration to ensure consistency and quality.

## Component: _______________
**File**: `src/components/___/___.___ → .tsx`
**Date Started**: _______
**Date Completed**: _______
**Migrated By**: Claude Code

---

## Pre-Migration Analysis

### Current State
- [ ] Component reviewed and understood
- [ ] All props documented
- [ ] All state documented
- [ ] All side effects documented
- [ ] Existing tests reviewed
- [ ] Test coverage noted: ____%

### Dependencies
- [ ] External dependencies identified
- [ ] Internal component dependencies identified
- [ ] Service/API dependencies identified
- [ ] Context dependencies identified

### Form Analysis (if applicable)
- [ ] Form fields identified
- [ ] Validation requirements documented
- [ ] Submit handler analyzed
- [ ] Error handling analyzed
- [ ] Zod schema selected: __________

---

## Migration Steps

### 1. File Setup
- [ ] Create backup of original file
- [ ] Rename `.jsx` → `.tsx`
- [ ] Update file imports in parent components

### 2. Type Definitions
- [ ] Props interface created
- [ ] Props using TypeScript types (not PropTypes)
- [ ] State types defined
- [ ] Event handler types defined
- [ ] Custom hook return types defined (if any)

### 3. Form Integration (if applicable)
- [ ] React Hook Form imported
- [ ] Zod resolver imported
- [ ] `useForm` hook configured with schema
- [ ] Form fields connected with `register`
- [ ] Error messages displayed from `formState.errors`
- [ ] Submit handler uses typed form data
- [ ] Loading states handled
- [ ] Success states handled
- [ ] Error states handled

### 4. Path Alias Updates
- [ ] Imports use `@/lib/validations` (if using schemas)
- [ ] Imports use `@/components` (if importing components)
- [ ] Imports use `@/services` (if using services)
- [ ] Imports use `@/contexts` (if using contexts)
- [ ] Imports use `@/utils` (if using utilities)

### 5. Code Quality
- [ ] No `any` types used
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Consistent code formatting
- [ ] Comments updated (if needed)
- [ ] Console logs removed

### 6. Accessibility
- [ ] Form labels present and associated
- [ ] Error messages have `role="alert"`
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] ARIA attributes appropriate

---

## Testing

### Automated Tests
- [ ] All existing tests pass
- [ ] Tests updated for TypeScript
- [ ] New tests for validation errors
- [ ] New tests for success paths
- [ ] Edge cases tested
- [ ] Test coverage maintained or improved

### Manual Testing
- [ ] Component renders correctly
- [ ] All interactions work
- [ ] Form validation works (if applicable)
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Loading states display correctly
- [ ] Responsive design maintained
- [ ] Dark mode works correctly
- [ ] Accessibility verified

### Type Checking
- [ ] `npx tsc --noEmit` passes
- [ ] No TypeScript warnings
- [ ] Types properly exported (if reusable)

### Build Testing
- [ ] Dev server runs without errors
- [ ] Production build succeeds: `npm run build`
- [ ] Built app works in preview: `npm run preview`

---

## Documentation

- [ ] Props documented with JSDoc (if public component)
- [ ] Complex logic commented
- [ ] Type exports documented
- [ ] Migration notes added (if needed)
- [ ] README updated (if component is in library)

---

## Commit

### Commit Message Template
```
Migrate [ComponentName] to TypeScript + React Hook Form

- Convert [ComponentName].jsx → .tsx
- Add TypeScript types for props and state
- Integrate React Hook Form with Zod validation
- Use [schemaName] for form validation
- Update imports to use path aliases
- All [X] tests passing

Related to: Day [X] of modernization plan
```

### Pre-Commit Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Changes staged: `git add src/components/.../...tsx`
- [ ] Commit message follows template
- [ ] Commit made to feature branch

---

## Post-Migration

### Integration Testing
- [ ] Component works in parent components
- [ ] Data flows correctly
- [ ] State management works
- [ ] Side effects work correctly

### Performance Check
- [ ] No performance regressions
- [ ] Re-renders minimized
- [ ] Memoization used appropriately

### Code Review
- [ ] Self-review completed
- [ ] Changes match migration strategy
- [ ] Best practices followed
- [ ] No debug code left

---

## Notes

_Add any specific notes about this migration here_

---

## Sign-Off

Migration completed: ☐
Tests passing: ☐
Ready for next component: ☐

---

## Common Issues & Solutions

### Issue: TypeScript errors on existing code
**Solution**: Add temporary `// @ts-expect-error` with explanation, create TODO to fix properly

### Issue: Tests fail after migration
**Solution**: Check that test imports are updated, mock types are correct

### Issue: Form validation not showing errors
**Solution**: Ensure `formState.errors` is accessed, trigger validation mode is set

### Issue: Path aliases not resolving
**Solution**: Check `tsconfig.json` paths match `vite.config.ts` alias config

### Issue: Build fails but dev works
**Solution**: Run `npx tsc --noEmit` to find type errors not caught in dev
