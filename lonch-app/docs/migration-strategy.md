# Component Migration Strategy

**Status**: Week 1 Complete - Ready for Component Migration
**Branch**: `feature/modernize`
**Last Updated**: 2025-10-31

## Week 1 Accomplishments ✅

### Day 1: Infrastructure Setup
- ✅ Installed all modernization dependencies
  - shadcn/ui components and dependencies
  - TypeScript and type definitions
  - Zod for validation
  - React Hook Form
  - Lucide React icons
  - Framer Motion for animations
  - jest-axe for accessibility testing
- ✅ Created `src/lib/utils.ts` (cn utility)
- ✅ Created `src/components/ui/` directory
- ✅ All 650 tests passing
- ✅ Checkpoint: `checkpoint/day1-dependencies`

### Day 2: Design Tokens + Theme System
- ✅ Implemented CSS variables for Lonch brand colors
  - Primary: Teal #2D9B9B (light) / #3DB3B3 (dark)
  - Accent: Gold #DBA507 (light) / #E5B31A (dark)
  - Full semantic color system (background, foreground, muted, etc.)
- ✅ Converted `tailwind.config.js` → `tailwind.config.ts`
- ✅ Created `ThemeProvider` with localStorage persistence
- ✅ Created `ThemeToggle` component (visible in footer)
- ✅ Updated Header, Footer, Home page with theme-aware classes
- ✅ Full light/dark mode support working
- ✅ All 650 tests passing
- ✅ Checkpoint: `checkpoint/day2-theming`

### Day 3: TypeScript Configuration
- ✅ Created `tsconfig.json` with strict mode enabled
- ✅ Created `tsconfig.node.json` for build tooling
- ✅ Converted `vite.config.js` → `vite.config.ts`
- ✅ Set up path aliases (@/, @/components, @/services, etc.)
- ✅ Created type definitions:
  - `src/types/index.ts` - Core app types (Project, Document, User, etc.)
  - `src/types/firebase.d.ts` - Firebase type extensions
- ✅ All 650 tests passing
- ✅ Checkpoint: `checkpoint/day3-typescript`

### Day 4: Form Validation Schemas
- ✅ Created comprehensive Zod validation schemas:
  - Authentication (login, signup, password reset)
  - Projects (create, update, status)
  - Members (invite, roles, groups, invite links)
  - Documents (upload, metadata, visibility, bulk operations)
- ✅ Type-safe schemas with TypeScript inference
- ✅ Reusable sub-schemas (email, password, etc.)
- ✅ Central export from `src/lib/validations/index.ts`
- ✅ All 650 tests passing
- ✅ Checkpoint: `checkpoint/day4-validation`

## Current State

### Test Coverage
- **Total Tests**: 650 passing
- **Test Files**: 38
- **Coverage**: Maintained throughout migration

### Technology Stack
| Technology | Status | Notes |
|------------|--------|-------|
| React 19 | ✅ Installed | Latest stable |
| Vite 7.1.9 | ✅ Configured | TypeScript support added |
| Tailwind CSS 3.4 | ✅ Enhanced | CSS variables, dark mode |
| TypeScript | ✅ Configured | Strict mode, path aliases |
| Zod | ✅ Ready | All schemas created |
| React Hook Form | ✅ Installed | Ready for integration |
| Lucide React | ✅ Installed | Used in ThemeToggle |
| shadcn/ui | ✅ Ready | Utils installed, ready for components |

### File Structure
```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (1 so far)
│   │   └── theme-toggle.tsx   ✅
│   ├── theme-provider.tsx     ✅
│   ├── auth/                  # Authentication components
│   ├── layout/                # Layout components (Header, Footer)
│   ├── pages/                 # Page components
│   ├── project/               # Project-related components
│   ├── documents/             # Document components
│   └── ...
├── lib/
│   ├── utils.ts              ✅ shadcn/ui utilities
│   └── validations/          ✅ Zod schemas
│       ├── index.ts
│       ├── auth.ts
│       ├── project.ts
│       ├── member.ts
│       └── document.ts
├── types/
│   ├── index.ts              ✅ Core type definitions
│   └── firebase.d.ts         ✅ Firebase types
├── services/                  # Backend services
├── contexts/                  # React contexts
├── utils/                     # Utility functions
└── config/                    # Configuration files
```

## Migration Strategy: Week 2 (Days 6-10)

### Approach: Bottom-Up + High-Impact First

We'll migrate components in this order to maximize impact while maintaining stability:

#### Phase 1: Authentication Components (Days 6-7)
**Why First**: Highest user interaction, clear forms, immediate impact

1. **LoginPage** → TypeScript + React Hook Form + Zod
   - File: `src/components/auth/LoginPage.jsx` → `.tsx`
   - Use `loginSchema` from validations
   - Integrate React Hook Form
   - Add proper error handling
   - Maintain existing tests

2. **SignupPage** → TypeScript + React Hook Form + Zod
   - File: `src/components/auth/SignupPage.jsx` → `.tsx`
   - Use `signupSchema` with password matching
   - Show password strength indicators
   - Real-time validation feedback
   - Maintain existing tests

**Success Criteria**:
- [ ] Forms validate on blur and submit
- [ ] Clear error messages from Zod
- [ ] Type-safe form data
- [ ] All existing tests pass
- [ ] New tests for validation edge cases

#### Phase 2: Project Creation Flow (Days 8-9)
**Why Second**: Core user journey, complex form

1. **Wizard Component** → TypeScript migration
   - File: `src/components/pages/Wizard.jsx` → `.tsx`
   - Use `createProjectSchema`
   - Multi-step form validation
   - Document upload with validation

2. **InviteUserModal** → TypeScript + React Hook Form
   - File: `src/components/project/InviteUserModal.jsx` → `.tsx`
   - Use `inviteUserSchema`
   - Role and group selection
   - Email validation

**Success Criteria**:
- [ ] Multi-step wizard maintains state correctly
- [ ] Document uploads validate size and type
- [ ] Invite modal validates email and role
- [ ] All tests pass

#### Phase 3: Document Management (Day 10)
**Why Third**: File handling, bulk operations

1. **DocumentUpload** → Enhanced validation
   - File: `src/components/documents/DocumentUpload.jsx` → `.tsx`
   - Use `fileUploadSchema` and `bulkUploadSchema`
   - Better error messages for file type/size

2. **DocumentList** → TypeScript migration
   - File: `src/components/documents/DocumentList.jsx` → `.tsx`
   - Bulk operations with validation

## Migration Checklist Template

For each component migration:

### Pre-Migration
- [ ] Review current component functionality
- [ ] Identify all props and state
- [ ] Check existing test coverage
- [ ] Create migration branch from `feature/modernize`

### During Migration
- [ ] Rename `.jsx` → `.tsx`
- [ ] Add TypeScript types for props
- [ ] Add TypeScript types for state
- [ ] Replace inline validation with Zod schema
- [ ] Integrate React Hook Form if form component
- [ ] Update imports to use path aliases (`@/lib/validations`)
- [ ] Maintain or improve accessibility
- [ ] Add `use client` directive if needed (for future Next.js compat)

### Post-Migration
- [ ] Run tests: `npm test`
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Check dev server for errors
- [ ] Manual testing of component
- [ ] Update tests if needed
- [ ] Commit with descriptive message

### Testing Strategy
- [ ] Existing tests must continue to pass
- [ ] Add tests for new validation scenarios
- [ ] Test error states with invalid data
- [ ] Test success paths with valid data
- [ ] Test edge cases (empty strings, special characters, etc.)

## Component Priority Matrix

### High Priority (Week 2)
| Component | Complexity | User Impact | Migration Day |
|-----------|------------|-------------|---------------|
| LoginPage | Low | Very High | Day 6 |
| SignupPage | Low | Very High | Day 7 |
| Wizard | High | High | Day 8 |
| InviteUserModal | Medium | High | Day 9 |
| DocumentUpload | Medium | High | Day 10 |

### Medium Priority (Week 3)
| Component | Complexity | User Impact | Migration Day |
|-----------|------------|-------------|---------------|
| DocumentList | Medium | Medium | Day 11 |
| ProjectMembersPanel | Medium | Medium | Day 12 |
| Settings | Medium | Medium | Day 13 |
| NotificationPreferences | Low | Low | Day 14 |

### Low Priority (Future)
- Layout components (Header, Footer) - Already using theme-aware classes
- Static pages
- Utility components

## Risk Mitigation

### Rollback Strategy
1. Each day has a checkpoint tag
2. Can rollback to any checkpoint: `git reset --hard checkpoint/dayX`
3. Feature branch protects main

### Testing Strategy
1. Run full test suite after each migration
2. Manual testing of migrated components
3. Keep tests green at all times
4. No merging to main until Week 3 complete

### Communication
- Commit messages clearly describe changes
- Each component migration is one commit
- Checkpoints mark completion of each day
- This document tracks progress

## Next Steps (Day 6)

**Tomorrow**: Start with LoginPage migration

1. Create migration branch
2. Migrate LoginPage to TypeScript
3. Integrate React Hook Form
4. Use loginSchema for validation
5. Update tests
6. Create checkpoint

**Goal**: By end of Day 6, have a fully functional, type-safe, validated login form.

## Success Metrics

Week 1:
- ✅ 4 checkpoints created
- ✅ 0 test regressions
- ✅ Theme system working
- ✅ TypeScript configured
- ✅ Validation schemas ready

Week 2 Goals:
- [ ] 5 major components migrated
- [ ] 0 test regressions
- [ ] Improved form validation UX
- [ ] Type safety across auth flow

Week 3 Goals:
- [ ] All critical components migrated
- [ ] Production build successful
- [ ] Ready to merge to main
- [ ] Documentation updated
