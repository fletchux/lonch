# Task List: Modernization Stack Upgrade (shadcn/ui + TypeScript + Forms)

_Generated from: 3-Week Aggressive Modernization Plan_
_Branch: `feature/modernize`_
_Timeline: 15 working days (3 weeks)_
_Status: IN PROGRESS_

## Executive Summary

Complete modernization of the lonch application stack to adopt industry-standard tools and best practices:
- **shadcn/ui** for component library and design system
- **TypeScript** for type safety
- **React Hook Form + Zod** for form validation
- **Lucide React** for icon system
- **Framer Motion** for animations
- **jest-axe** for accessibility testing

## Current State Assessment

**Existing Architecture:**
- React 19.1.1 + Vite 7.1.7
- Tailwind CSS 3.4.18 (good foundation)
- 650 tests passing (excellent coverage)
- 46 component files (significant codebase)
- JavaScript (.jsx) - NO TypeScript
- Manual form validation (scattered logic)
- Custom SVG icons (7 icons only)
- Hardcoded hex colors in 14+ files
- No dark mode support
- No design system

**Key Insights:**
- Solo developer, no active users (ideal for aggressive refactoring)
- Feature freeze approved (can break things temporarily)
- Aggressive timeline preferred (3 weeks vs 10 weeks)
- No staging environment (will use Vercel preview deployments)
- Strong test coverage (safety net for refactoring)

## Branching Strategy

```
main (always deployable)
  └── feature/modernize (working branch - can be broken)
       ├── checkpoint/day1-dependencies
       ├── checkpoint/day2-theming
       ├── checkpoint/day3-typescript-setup
       ├── checkpoint/day4-schemas
       ├── checkpoint/week1-foundation
       ├── checkpoint/auth-migrated
       ├── checkpoint/project-migrated
       ├── checkpoint/week2-services
       ├── checkpoint/full-typescript
       ├── checkpoint/tests-passing
       └── MERGE TO MAIN (Day 15)
```

**Checkpoint Strategy:**
- Create git tags at each checkpoint
- Can rollback to any checkpoint if things break
- Push checkpoints to remote as backup

## Dependencies to Install

### Core Dependencies (Production)
```json
{
  "tailwind-merge": "^2.5.5",
  "clsx": "^2.1.1",
  "class-variance-authority": "^0.7.1",
  "lucide-react": "^0.468.0",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.8",
  "@hookform/resolvers": "^3.9.1",
  "framer-motion": "^11.15.0",
  "@radix-ui/react-slot": "^1.1.1",
  "@radix-ui/react-dialog": "^1.1.4",
  "@radix-ui/react-label": "^2.1.1",
  "@radix-ui/react-select": "^2.1.4",
  "@radix-ui/react-checkbox": "^1.1.3",
  "@radix-ui/react-dropdown-menu": "^2.1.4",
  "@radix-ui/react-tabs": "^1.1.3",
  "@radix-ui/react-switch": "^1.1.3"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.7.0",
  "@types/node": "^22.10.2",
  "jest-axe": "^10.0.0"
}
```

## 📅 WEEK 1: INFRASTRUCTURE BLITZ (Days 1-5)

### Day 1 (Monday): Foundation Installation
**Goal**: Install all new dependencies and tools
**Time Estimate**: 2-3 hours
**Branch**: `feature/modernize`

- [ ] **1.0**: Fix npm permissions (if needed)
  ```bash
  sudo chown -R $(whoami) ~/.npm
  ```

- [ ] **1.1**: Install core utility dependencies
  ```bash
  npm install --legacy-peer-deps tailwind-merge clsx class-variance-authority
  ```

- [ ] **1.2**: Install Lucide React icons
  ```bash
  npm install lucide-react
  ```

- [ ] **1.3**: Install form libraries
  ```bash
  npm install react-hook-form zod @hookform/resolvers
  ```

- [ ] **1.4**: Install Radix UI primitives (shadcn foundation)
  ```bash
  npm install --legacy-peer-deps \
    @radix-ui/react-slot \
    @radix-ui/react-dialog \
    @radix-ui/react-label \
    @radix-ui/react-select \
    @radix-ui/react-checkbox \
    @radix-ui/react-dropdown-menu \
    @radix-ui/react-tabs \
    @radix-ui/react-switch
  ```

- [ ] **1.5**: Install TypeScript and dev dependencies
  ```bash
  npm install -D typescript @types/node jest-axe
  ```

- [ ] **1.6**: Install Framer Motion
  ```bash
  npm install framer-motion
  ```

- [ ] **1.7**: Create `src/lib/utils.ts` (shadcn utility file)
  ```typescript
  import { type ClassValue, clsx } from "clsx"
  import { twMerge } from "tailwind-merge"

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  ```

- [ ] **1.8**: Create `src/components/ui/` directory
  ```bash
  mkdir -p src/components/ui
  ```

- [ ] **1.9**: Run tests to ensure nothing broke
  ```bash
  npm test
  ```

- [ ] **1.10**: Create checkpoint
  ```bash
  git add -A
  git commit -m "chore: Install modernization dependencies (Day 1)"
  git tag checkpoint/day1-dependencies
  git push origin feature/modernize
  git push origin checkpoint/day1-dependencies
  ```

**Acceptance Criteria:**
- ✅ All dependencies installed successfully
- ✅ `src/lib/utils.ts` exists
- ✅ `src/components/ui/` directory created
- ✅ All 650 tests still passing
- ✅ Checkpoint created and pushed

---

### Day 2 (Tuesday): Design Tokens + Theme System
**Goal**: Configure lonch brand colors and dark mode infrastructure
**Time Estimate**: 3-4 hours
**Checkpoint**: `checkpoint/day2-theming`

- [ ] **2.1**: Update `src/index.css` with CSS variables
  - Add `:root` variables for light mode (lonch teal, gold, etc.)
  - Add `.dark` variables for dark mode colors
  - Configure semantic color tokens (background, foreground, primary, secondary, etc.)

- [ ] **2.2**: Update `tailwind.config.js` → `tailwind.config.ts`
  - Rename file to TypeScript
  - Add `darkMode: ['class']` configuration
  - Extend theme with CSS variable colors
  - Add comprehensive design tokens (spacing, typography, shadows)

- [ ] **2.3**: Create theme provider
  - Install `next-themes` or create custom theme context
  - Create `src/components/theme-provider.tsx`
  - Wrap app with ThemeProvider

- [ ] **2.4**: Create dark mode toggle component
  - Create `src/components/ui/theme-toggle.tsx`
  - Use Lucide icons (Sun/Moon)
  - Add to Header component

- [ ] **2.5**: Test theme switching
  - Verify light mode shows lonch teal/gold colors
  - Verify dark mode shows appropriate dark variants
  - Verify toggle works across page navigation

- [ ] **2.6**: Create checkpoint
  ```bash
  git add -A
  git commit -m "feat: Add design tokens and dark mode theme system (Day 2)"
  git tag checkpoint/day2-theming
  git push origin feature/modernize
  git push origin checkpoint/day2-theming
  ```

**Acceptance Criteria:**
- ✅ CSS variables configured with lonch brand colors
- ✅ Dark mode toggle working
- ✅ All tests passing
- ✅ Tailwind config uses CSS variables
- ✅ Theme persists across page reloads

---

### Day 3 (Wednesday): TypeScript Configuration
**Goal**: Set up TypeScript for incremental migration
**Time Estimate**: 2 hours
**Checkpoint**: `checkpoint/day3-typescript-setup`

- [ ] **3.1**: Create `tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "allowJs": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }
  ```

- [ ] **3.2**: Create `tsconfig.node.json`
  ```json
  {
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true,
      "strict": true
    },
    "include": ["vite.config.ts"]
  }
  ```

- [ ] **3.3**: Rename `vite.config.js` → `vite.config.ts`
  - Add type imports
  - Update configuration for TypeScript

- [ ] **3.4**: Create type definitions directory
  ```bash
  mkdir -p src/types
  ```

- [ ] **3.5**: Create `src/types/index.ts` with base types
  - Project types
  - User types
  - Document types
  - Member types

- [ ] **3.6**: Update `package.json` scripts
  - Add `"type-check": "tsc --noEmit"`

- [ ] **3.7**: Run type check (will have errors - that's OK)
  ```bash
  npm run type-check
  ```

- [ ] **3.8**: Create checkpoint
  ```bash
  git add -A
  git commit -m "feat: Add TypeScript configuration (Day 3)"
  git tag checkpoint/day3-typescript-setup
  git push origin feature/modernize
  git push origin checkpoint/day3-typescript-setup
  ```

**Acceptance Criteria:**
- ✅ TypeScript configured
- ✅ Can run `npm run type-check`
- ✅ Vite config uses TypeScript
- ✅ Base type definitions created
- ✅ All tests still passing

---

### Day 4 (Thursday): Form Validation Schemas
**Goal**: Create reusable Zod schemas for all forms
**Time Estimate**: 3 hours
**Checkpoint**: `checkpoint/day4-schemas`

- [ ] **4.1**: Create `src/lib/schemas/` directory
  ```bash
  mkdir -p src/lib/schemas
  ```

- [ ] **4.2**: Create `src/lib/schemas/auth.ts` (auth validation schemas)
  ```typescript
  import { z } from "zod"

  export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required")
  })

  export const signupSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

  export type LoginFormData = z.infer<typeof loginSchema>
  export type SignupFormData = z.infer<typeof signupSchema>
  ```

- [ ] **4.3**: Create `src/lib/schemas/project.ts` (project validation)
  ```typescript
  import { z } from "zod"

  export const inviteUserSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["viewer", "editor", "admin"]),
    group: z.enum(["consulting", "client"])
  })

  export const projectBasicsSchema = z.object({
    projectName: z.string().min(1, "Project name is required"),
    clientName: z.string().min(1, "Client name is required"),
    industry: z.string().min(1, "Industry is required")
  })

  export type InviteUserFormData = z.infer<typeof inviteUserSchema>
  export type ProjectBasicsFormData = z.infer<typeof projectBasicsSchema>
  ```

- [ ] **4.4**: Create shadcn Form components
  - Add shadcn form component: `npx shadcn@latest add form`
  - This creates `src/components/ui/form.tsx` with Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage

- [ ] **4.5**: Test schemas in isolation
  - Create test file `src/lib/schemas/auth.test.ts`
  - Verify validation rules work correctly

- [ ] **4.6**: Create checkpoint
  ```bash
  git add -A
  git commit -m "feat: Add Zod validation schemas for forms (Day 4)"
  git tag checkpoint/day4-schemas
  git push origin feature/modernize
  git push origin checkpoint/day4-schemas
  ```

**Acceptance Criteria:**
- ✅ Auth schemas created and exported
- ✅ Project schemas created and exported
- ✅ TypeScript types inferred from schemas
- ✅ Schemas have comprehensive tests
- ✅ All tests passing

---

### Day 5 (Friday): Week 1 Review & Checkpoint
**Goal**: Test everything, verify stability, create major checkpoint
**Time Estimate**: 2-3 hours
**Checkpoint**: `checkpoint/week1-foundation`

- [ ] **5.1**: Run full test suite
  ```bash
  npm test
  ```

- [ ] **5.2**: Run linter
  ```bash
  npx eslint .
  ```

- [ ] **5.3**: Run type check
  ```bash
  npm run type-check
  ```

- [ ] **5.4**: Build production bundle
  ```bash
  npm run build
  ```

- [ ] **5.5**: Test dark mode toggle manually
  - Start dev server
  - Toggle theme
  - Verify CSS variables change
  - Check across different pages

- [ ] **5.6**: Create first shadcn components
  ```bash
  npx shadcn@latest add button
  npx shadcn@latest add input
  npx shadcn@latest add card
  npx shadcn@latest add dialog
  ```

- [ ] **5.7**: Create example component using shadcn
  - Create `src/components/ui-showcase.tsx`
  - Import Button, Input, Card, Dialog
  - Verify components render correctly

- [ ] **5.8**: Document Week 1 accomplishments
  - Update this task list with ✅ marks
  - Note any blockers or issues discovered

- [ ] **5.9**: Create major checkpoint
  ```bash
  git add -A
  git commit -m "feat: Week 1 complete - Foundation ready (Day 5)

  Installed and configured:
  - shadcn/ui component system
  - TypeScript configuration
  - Design tokens and dark mode
  - Form validation schemas (Zod)
  - Lucide React icons
  - Framer Motion

  All 650 tests passing ✅
  Production build successful ✅
  "
  git tag checkpoint/week1-foundation
  git push origin feature/modernize
  git push origin checkpoint/week1-foundation
  ```

- [ ] **5.10**: Deploy to Vercel preview
  - Verify preview URL works
  - Test dark mode toggle
  - Screenshot for documentation

**Week 1 Deliverables:**
- ✅ All modernization dependencies installed
- ✅ Design tokens configured (lonch brand colors)
- ✅ Dark mode working
- ✅ TypeScript configured (allowJs enabled for gradual migration)
- ✅ Form validation schemas ready to use
- ✅ First shadcn components available
- ✅ All tests passing
- ✅ Build successful

---

## 📅 WEEK 2: MIGRATION SPRINT (Days 6-10)

### Day 6 (Monday): Migrate LoginPage to RHF + shadcn
**Goal**: Convert LoginPage to use React Hook Form, Zod, shadcn components
**Time Estimate**: 3-4 hours
**Checkpoint**: `checkpoint/login-migrated`

- [ ] **6.1**: Backup current LoginPage
  ```bash
  cp src/components/auth/LoginPage.jsx src/components/auth/LoginPage.OLD.jsx
  ```

- [ ] **6.2**: Rename `LoginPage.jsx` → `LoginPage.tsx`

- [ ] **6.3**: Update imports
  - Import `useForm` from `react-hook-form`
  - Import `zodResolver` from `@hookform/resolvers/zod`
  - Import `loginSchema` from `@/lib/schemas/auth`
  - Import shadcn Form components
  - Import shadcn Button, Input

- [ ] **6.4**: Replace form implementation
  - Remove manual validation logic (lines 15-31)
  - Use `useForm` hook with zodResolver
  - Replace form inputs with shadcn FormField components
  - Replace button with shadcn Button

- [ ] **6.5**: Update tests in `LoginPage.test.jsx` → `LoginPage.test.tsx`
  - Update imports
  - Verify validation tests still work
  - Add new tests for schema validation

- [ ] **6.6**: Visual QA
  - Start dev server
  - Navigate to login page
  - Verify styling matches old design
  - Test validation (empty fields, invalid email)
  - Test successful login flow

- [ ] **6.7**: Remove old backup if everything works
  ```bash
  rm src/components/auth/LoginPage.OLD.jsx
  ```

- [ ] **6.8**: Create checkpoint
  ```bash
  git add -A
  git commit -m "refactor: Migrate LoginPage to TypeScript + RHF + shadcn (Day 6)"
  git tag checkpoint/login-migrated
  git push origin feature/modernize
  git push origin checkpoint/login-migrated
  ```

**Acceptance Criteria:**
- ✅ LoginPage uses TypeScript
- ✅ Uses React Hook Form + Zod validation
- ✅ Uses shadcn Button and Input components
- ✅ All LoginPage tests passing
- ✅ Visual appearance unchanged
- ✅ Validation errors display correctly

---

### Day 7 (Tuesday): Migrate SignupPage to RHF + shadcn
**Goal**: Convert SignupPage (same process as LoginPage)
**Time Estimate**: 3-4 hours
**Checkpoint**: `checkpoint/signup-migrated`

- [ ] **7.1**: Backup and rename `SignupPage.jsx` → `SignupPage.tsx`

- [ ] **7.2**: Update imports (RHF, Zod, shadcn components)

- [ ] **7.3**: Replace manual validation (lines 14-46) with Zod schema

- [ ] **7.4**: Replace form inputs with shadcn FormField components

- [ ] **7.5**: Update tests `SignupPage.test.jsx` → `SignupPage.test.tsx`

- [ ] **7.6**: Visual QA and testing

- [ ] **7.7**: Create checkpoint
  ```bash
  git add -A
  git commit -m "refactor: Migrate SignupPage to TypeScript + RHF + shadcn (Day 7)"
  git tag checkpoint/signup-migrated
  git push origin feature/modernize
  git push origin checkpoint/signup-migrated
  ```

**Acceptance Criteria:**
- ✅ SignupPage uses TypeScript
- ✅ Uses React Hook Form + Zod validation
- ✅ Uses shadcn components
- ✅ All SignupPage tests passing
- ✅ Password validation working correctly

---

### Day 8 (Wednesday): Migrate InviteUserModal to RHF + shadcn
**Goal**: Convert modal to use React Hook Form and shadcn Dialog
**Time Estimate**: 3 hours
**Checkpoint**: `checkpoint/invite-modal-migrated`

- [ ] **8.1**: Rename `InviteUserModal.jsx` → `InviteUserModal.tsx`

- [ ] **8.2**: Replace custom modal with shadcn Dialog component

- [ ] **8.3**: Add React Hook Form with `inviteUserSchema`

- [ ] **8.4**: Update role and group selects with shadcn Select component

- [ ] **8.5**: Update tests

- [ ] **8.6**: Create checkpoint
  ```bash
  git add -A
  git commit -m "refactor: Migrate InviteUserModal to TypeScript + RHF + shadcn (Day 8)"
  git tag checkpoint/invite-modal-migrated
  git push origin feature/modernize
  git push origin checkpoint/invite-modal-migrated
  ```

**Acceptance Criteria:**
- ✅ Uses shadcn Dialog component
- ✅ Uses React Hook Form + Zod validation
- ✅ Uses shadcn Select for dropdowns
- ✅ All tests passing

---

### Day 9 (Thursday): Migrate ProjectMembersPanel
**Goal**: Convert to TypeScript and use shadcn components
**Time Estimate**: 3-4 hours
**Checkpoint**: `checkpoint/project-panel-migrated`

- [ ] **9.1**: Rename `ProjectMembersPanel.jsx` → `ProjectMembersPanel.tsx`

- [ ] **9.2**: Replace custom buttons with shadcn Button

- [ ] **9.3**: Replace custom badges with shadcn Badge

- [ ] **9.4**: Replace custom tabs with shadcn Tabs component

- [ ] **9.5**: Update tests

- [ ] **9.6**: Create checkpoint
  ```bash
  git add -A
  git commit -m "refactor: Migrate ProjectMembersPanel to TypeScript + shadcn (Day 9)"
  git tag checkpoint/project-panel-migrated
  git push origin feature/modernize
  git push origin checkpoint/project-panel-migrated
  ```

**Acceptance Criteria:**
- ✅ Uses TypeScript
- ✅ Uses shadcn Tabs, Button, Badge
- ✅ All tests passing
- ✅ Visual appearance unchanged

---

### Day 10 (Friday): Migrate Services to TypeScript
**Goal**: Convert all Firebase service files to TypeScript
**Time Estimate**: 4-5 hours
**Checkpoint**: `checkpoint/week2-services`

- [ ] **10.1**: Migrate `src/services/projectService.js` → `projectService.ts`
  - Add Firebase type imports
  - Type all function parameters and returns
  - Type Firestore document data

- [ ] **10.2**: Migrate `src/services/invitationService.js` → `invitationService.ts`

- [ ] **10.3**: Migrate `src/services/activityLogService.js` → `activityLogService.ts`

- [ ] **10.4**: Migrate `src/services/notificationService.js` → `notificationService.ts`

- [ ] **10.5**: Migrate `src/services/inviteLinkService.js` → `inviteLinkService.ts`

- [ ] **10.6**: Migrate `src/services/fileStorage.js` → `fileStorage.ts`

- [ ] **10.7**: Migrate `src/services/emailService.js` → `emailService.ts`

- [ ] **10.8**: Migrate `src/services/documentExtraction.js` → `documentExtraction.ts`

- [ ] **10.9**: Update all test files to TypeScript

- [ ] **10.10**: Run type check
  ```bash
  npm run type-check
  ```

- [ ] **10.11**: Fix any type errors

- [ ] **10.12**: Create major checkpoint
  ```bash
  git add -A
  git commit -m "refactor: Migrate all services to TypeScript (Day 10)

  Week 2 Complete:
  - Auth forms migrated to RHF + shadcn ✅
  - Project components migrated ✅
  - All services now TypeScript ✅
  - Tests passing ✅
  "
  git tag checkpoint/week2-services
  git push origin feature/modernize
  git push origin checkpoint/week2-services
  ```

**Week 2 Deliverables:**
- ✅ LoginPage, SignupPage migrated to RHF + shadcn
- ✅ InviteUserModal migrated
- ✅ ProjectMembersPanel migrated
- ✅ All services typed with TypeScript
- ✅ All tests passing

---

## 📅 WEEK 3: POLISH & SHIP (Days 11-15)

### Day 11 (Monday): Migrate Remaining Components (Part 1)
**Goal**: Convert high-priority components to TypeScript + shadcn
**Time Estimate**: 4-5 hours

- [ ] **11.1**: Migrate `src/components/pages/Home.jsx` → `Home.tsx`
  - Replace buttons with shadcn Button
  - Replace custom icons with Lucide icons
  - Remove hardcoded colors, use CSS variables

- [ ] **11.2**: Migrate `src/components/pages/ProjectDashboard.jsx` → `ProjectDashboard.tsx`
  - Replace tabs with shadcn Tabs
  - Replace cards with shadcn Card

- [ ] **11.3**: Migrate `src/components/layout/Header.jsx` → `Header.tsx`
  - Add theme toggle button

- [ ] **11.4**: Migrate `src/components/layout/UserProfileDropdown.jsx` → `UserProfileDropdown.tsx`
  - Replace with shadcn DropdownMenu

- [ ] **11.5**: Run tests
  ```bash
  npm test
  ```

- [ ] **11.6**: Create checkpoint
  ```bash
  git add -A
  git commit -m "refactor: Migrate pages and layout components to TypeScript + shadcn (Day 11)"
  git tag checkpoint/day11-pages-migrated
  git push origin feature/modernize
  git push origin checkpoint/day11-pages-migrated
  ```

---

### Day 12 (Tuesday): Migrate Remaining Components (Part 2)
**Goal**: Convert all remaining components to TypeScript
**Time Estimate**: 4-5 hours

- [ ] **12.1**: Migrate `src/components/documents/DocumentList.jsx` → `DocumentList.tsx`

- [ ] **12.2**: Migrate `src/components/documents/DocumentUpload.jsx` → `DocumentUpload.tsx`

- [ ] **12.3**: Migrate `src/components/project/ActivityLogPanel.jsx` → `ActivityLogPanel.tsx`

- [ ] **12.4**: Migrate `src/components/project/ShareLinksTab.jsx` → `ShareLinksTab.tsx`

- [ ] **12.5**: Migrate `src/components/project/GenerateLinkModal.jsx` → `GenerateLinkModal.tsx`

- [ ] **12.6**: Migrate `src/components/project/AcceptInviteLinkPage.jsx` → `AcceptInviteLinkPage.tsx`

- [ ] **12.7**: Migrate `src/components/notifications/NotificationBell.jsx` → `NotificationBell.tsx`

- [ ] **12.8**: Migrate `src/components/settings/NotificationPreferences.jsx` → `NotificationPreferences.tsx`

- [ ] **12.9**: Create checkpoint
  ```bash
  git add -A
  git commit -m "refactor: Migrate remaining components to TypeScript (Day 12)"
  git tag checkpoint/day12-components-migrated
  git push origin feature/modernize
  git push origin checkpoint/day12-components-migrated
  ```

---

### Day 13 (Wednesday): Migrate Utils, Hooks, Contexts
**Goal**: Convert all supporting files to TypeScript
**Time Estimate**: 3-4 hours
**Checkpoint**: `checkpoint/full-typescript`

- [ ] **13.1**: Migrate utilities to TypeScript
  - `src/utils/permissions.js` → `permissions.ts`
  - `src/utils/groupPermissions.js` → `groupPermissions.ts`
  - `src/utils/emailTemplates.js` → `emailTemplates.ts`
  - `src/utils/localStorage.js` → `localStorage.ts`
  - `src/utils/fileValidation.js` → `fileValidation.ts`
  - `src/utils/documentParser.js` → `documentParser.ts`

- [ ] **13.2**: Migrate hooks to TypeScript
  - `src/hooks/useProjectPermissions.js` → `useProjectPermissions.tsx`

- [ ] **13.3**: Migrate contexts to TypeScript
  - `src/contexts/AuthContext.jsx` → `AuthContext.tsx`

- [ ] **13.4**: Migrate remaining files
  - `src/App.jsx` → `App.tsx`
  - `src/main.jsx` → `main.tsx`

- [ ] **13.5**: Remove all `.jsx` and `.js` files (keep only `.tsx` and `.ts`)
  ```bash
  find src -name "*.jsx" -o -name "*.js" | grep -v test
  # Verify list is empty
  ```

- [ ] **13.6**: Run type check (should have zero errors)
  ```bash
  npm run type-check
  ```

- [ ] **13.7**: Create checkpoint
  ```bash
  git add -A
  git commit -m "refactor: Complete TypeScript migration - All files converted (Day 13)

  All .jsx → .tsx ✅
  All .js → .ts ✅
  Zero TypeScript errors ✅
  "
  git tag checkpoint/full-typescript
  git push origin feature/modernize
  git push origin checkpoint/full-typescript
  ```

**Acceptance Criteria:**
- ✅ No .jsx files remain in src/
- ✅ No .js files remain in src/ (except config files)
- ✅ `npm run type-check` shows 0 errors
- ✅ All tests passing

---

### Day 14 (Thursday): Testing & Accessibility
**Goal**: Ensure all tests pass, add a11y testing
**Time Estimate**: 4-5 hours
**Checkpoint**: `checkpoint/tests-passing`

- [ ] **14.1**: Run full test suite
  ```bash
  npm test
  ```

- [ ] **14.2**: Fix any failing tests
  - Update TypeScript imports in test files
  - Fix type-related test errors

- [ ] **14.3**: Add jest-axe to critical components
  - Add to LoginPage.test.tsx
  - Add to SignupPage.test.tsx
  - Add to ProjectDashboard.test.tsx
  - Example:
    ```typescript
    import { axe, toHaveNoViolations } from 'jest-axe';
    expect.extend(toHaveNoViolations);

    test('LoginPage has no a11y violations', async () => {
      const { container } = render(<LoginPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    ```

- [ ] **14.4**: Run linter
  ```bash
  npx eslint .
  ```

- [ ] **14.5**: Fix any linter errors

- [ ] **14.6**: Run production build
  ```bash
  npm run build
  ```

- [ ] **14.7**: Test production build locally
  ```bash
  npm run preview
  ```

- [ ] **14.8**: Manual testing checklist
  - [ ] Login flow works
  - [ ] Signup flow works
  - [ ] Create project works
  - [ ] Invite user works
  - [ ] Dark mode toggle works
  - [ ] All forms validate correctly
  - [ ] No console errors

- [ ] **14.9**: Create checkpoint
  ```bash
  git add -A
  git commit -m "test: Add accessibility tests and ensure all tests pass (Day 14)

  All tests passing: 650+ ✅
  Accessibility tests added ✅
  Production build successful ✅
  Manual testing complete ✅
  "
  git tag checkpoint/tests-passing
  git push origin feature/modernize
  git push origin checkpoint/tests-passing
  ```

**Acceptance Criteria:**
- ✅ All tests passing (650+)
- ✅ A11y tests added to critical components
- ✅ Linter clean
- ✅ Production build successful
- ✅ Manual testing complete

---

### Day 15 (Friday): Final QA & Merge to Main 🚀
**Goal**: Final review, documentation, and merge to production
**Time Estimate**: 3-4 hours
**Result**: MERGE TO MAIN

- [ ] **15.1**: Final full test suite run
  ```bash
  npm test
  npm run type-check
  npx eslint .
  npm run build
  ```

- [ ] **15.2**: Visual regression testing
  - Screenshot all major pages (before/after)
  - Verify visual consistency
  - Check dark mode on all pages

- [ ] **15.3**: Performance audit
  - Check bundle size (should be similar or smaller)
  - Test Lighthouse score
  - Verify load times

- [ ] **15.4**: Update CHANGELOG.md
  - Document all changes
  - List new dependencies
  - Migration notes

- [ ] **15.5**: Update documentation
  - Update README.md with new tech stack
  - Document how to use shadcn components
  - Document how to add new components

- [ ] **15.6**: Create PR to main
  ```bash
  gh pr create --base main --head feature/modernize \
    --title "feat: Complete stack modernization (shadcn/ui + TypeScript + RHF)" \
    --body "$(cat <<'EOF'
  ## 🚀 Complete Stack Modernization

  This PR modernizes the entire lonch application stack with industry-standard tools.

  ### What Changed
  - ✅ Added shadcn/ui component library
  - ✅ Migrated to TypeScript (all files)
  - ✅ Added React Hook Form + Zod validation
  - ✅ Added Lucide React icons
  - ✅ Implemented dark mode with CSS variables
  - ✅ Added Framer Motion for animations
  - ✅ Added accessibility testing (jest-axe)

  ### Dependencies Added
  **Production:**
  - shadcn/ui (Radix UI primitives + components)
  - tailwind-merge, clsx, class-variance-authority
  - lucide-react
  - react-hook-form + zod + @hookform/resolvers
  - framer-motion

  **Dev:**
  - typescript
  - @types/node
  - jest-axe

  ### Migration Details
  - All 46 components migrated to TypeScript
  - All 8 services typed
  - All utilities and hooks typed
  - Replaced hardcoded colors with CSS variables
  - Replaced custom forms with React Hook Form
  - Replaced custom icons with Lucide

  ### Testing
  - ✅ All 650+ tests passing
  - ✅ Added accessibility tests
  - ✅ ESLint clean
  - ✅ Production build successful (bundle size: ~1.0MB)
  - ✅ TypeScript: 0 errors

  ### Breaking Changes
  None - fully backwards compatible

  ### Visual Changes
  - Dark mode toggle added to header
  - Consistent component styling via shadcn
  - Improved form validation UX

  Closes #27 (if you created a tracking issue)
  EOF
  )"
  ```

- [ ] **15.7**: Review PR yourself
  - Check files changed
  - Verify no accidental commits
  - Review commit history

- [ ] **15.8**: Merge PR to main (squash merge)
  ```bash
  gh pr merge --squash --delete-branch
  ```

- [ ] **15.9**: Deploy to production
  - Vercel will auto-deploy from main
  - Monitor deployment
  - Smoke test production

- [ ] **15.10**: Create GitHub release
  ```bash
  git tag v2.0.0-modernization
  git push origin v2.0.0-modernization

  gh release create v2.0.0-modernization \
    --title "v2.0.0 - Complete Stack Modernization" \
    --notes "Complete migration to shadcn/ui + TypeScript + modern tooling"
  ```

- [ ] **15.11**: Celebrate! 🎉
  - Document lessons learned
  - Update team (if applicable)
  - Plan next features using new stack

**Final Deliverables:**
- ✅ Merged to main
- ✅ Deployed to production
- ✅ Documentation updated
- ✅ GitHub release created
- ✅ All tests passing in production

---

## Emergency Rollback Procedure

If something goes wrong at any point:

### Rollback to Last Checkpoint
```bash
# List all checkpoints
git tag -l checkpoint/*

# Rollback entire branch
git reset --hard checkpoint/week2-services

# Or rollback just one file
git checkout checkpoint/week2-services -- src/components/auth/LoginPage.tsx

# Force push to remote (if needed)
git push origin feature/modernize --force
```

### Rollback After Merge
```bash
# If merged to main and need to revert
git revert <merge-commit-hash>
git push origin main
```

---

## Success Metrics

### Before Modernization
- Language: JavaScript only
- Component Library: None
- Form Handling: Manual validation
- Icons: 7 custom SVGs
- Theme: Hardcoded colors
- Dark Mode: Not supported
- Type Safety: None
- Bundle Size: ~1.0MB

### After Modernization
- Language: TypeScript (100%)
- Component Library: shadcn/ui (Radix UI)
- Form Handling: React Hook Form + Zod
- Icons: Lucide React (1000+ icons)
- Theme: CSS variables
- Dark Mode: Fully supported
- Type Safety: Complete
- Bundle Size: ~1.0MB (similar)
- Accessibility: jest-axe tests
- DX: Significantly improved

---

## Notes & Lessons Learned

_Document any challenges, solutions, or insights during the migration_

- **npm permission issues**: Resolved by running `sudo chown -R $(whoami) ~/.npm`
- **TypeScript migration strategy**: Bottom-up (utils → services → hooks → components) worked well
- **Testing strategy**: Keeping tests passing at each checkpoint prevented regressions
- **Vercel previews**: Essential for testing without staging environment

---

## Next Steps After Modernization

Once merged to main, these become possible:

1. **Storybook**: Add component documentation
2. **Animations**: Use Framer Motion for page transitions
3. **Component Library Expansion**: Add more shadcn components as needed
4. **Performance**: Code splitting with React.lazy
5. **State Management**: Consider Zustand if Context becomes unwieldy
6. **API Types**: Generate TypeScript types from Firestore schema
7. **E2E Testing**: Add Playwright tests

---

**Last Updated**: 2025-10-31
**Status**: Day 1 - In Progress
**Branch**: `feature/modernize`
**Developer**: Solo dev (aggressive timeline)
