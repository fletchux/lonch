  🎨 Design System for Lonch Project

  System: Tailwind CSS (Utility-First CSS Framework)

  Provider: Tailwind LabsVersion: 3.4.18

  ---
  How It Works

  1. Utility-First Approach

  Instead of writing custom CSS, you compose designs using pre-built utility classes:

  // Example from GenerateLinkModal.jsx
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
      <h2 className="text-xl font-semibold text-gray-900">Title</h2>
    </div>
  </div>

  2. Custom Theme Extensions

  Defined in tailwind.config.js:

  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#DBA507',  // Gold accent color
          dark: '#B88906',
        }
      }
    },
  }

  3. Consistent Color System

  Built-in Tailwind colors used:
  - Teal (#2D9B9B): Consulting group, primary actions
  - Yellow/Gold (#DBA507): Client group, accent color
  - Blue: Editor role
  - Gray: Viewer role, neutral UI elements
  - Red: Errors, warnings
  - Green: Success states

  Examples from codebase:
  // RoleBadge.jsx - Role colors
  teal: 'bg-teal-100 text-teal-800 border-teal-300',   // Owner
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300', // Admin
  blue: 'bg-blue-100 text-blue-800 border-blue-300',    // Editor
  gray: 'bg-gray-100 text-gray-800 border-gray-300'     // Viewer

  // GroupBadge.jsx - Group colors
  Consulting: 'bg-teal-100 text-teal-800'
  Client: 'bg-yellow-100 text-yellow-800'

  ---
  How It's Maintained

  Installation & Setup

  Dependencies (from package.json):
  {
    "devDependencies": {
      "tailwindcss": "^3.4.18",
      "autoprefixer": "^10.4.21",
      "postcss": "^8.5.6"
    }
  }

  Configuration files:
  - tailwind.config.js - Theme customization
  - postcss.config.js - PostCSS processing
  - src/index.css - Tailwind directives (@tailwind base, components, utilities)

  No External Design System

  Lonch doesn't use a pre-built component library like:
  - ❌ Material-UI (MUI)
  - ❌ Ant Design
  - ❌ Chakra UI
  - ❌ shadcn/ui

  Instead, it uses custom components built with Tailwind utilities.

  Component Pattern

  Components define their own styles using Tailwind classes:

  // src/components/shared/RoleBadge.jsx
  export default function RoleBadge({ role, size = 'sm' }) {
    const sizeClasses = {
      xs: 'px-1.5 py-0.5 text-xs',
      sm: 'px-2 py-1 text-xs',
      md: 'px-2.5 py-1.5 text-sm',
      lg: 'px-3 py-2 text-base'
    };

    return (
      <span className={`inline-flex items-center rounded-full border ${sizeClasses[size]}`}>
        {displayName}
      </span>
    );
  }

  ---
  Maintenance Approach

  1. Configuration Management

  - Custom colors/spacing: Add to tailwind.config.js
  - Keeps design tokens centralized
  - Version controlled in git

  2. Component Library

  Custom reusable components in src/components/shared/:
  - RoleBadge.jsx - Displays user roles
  - GroupBadge.jsx - Displays group membership
  - More as needed

  3. Updates

  # Update Tailwind CSS
  npm update tailwindcss

  # Updates managed via package.json

  4. Build Process

  - Tailwind scans all JSX files (configured in tailwind.config.js)
  - Generates CSS with only classes actually used
  - Optimized for production (small bundle size)

  ---
  Design System Conventions

  Spacing Scale

  Uses Tailwind's default 4px scale:
  - p-1 = 4px padding
  - p-2 = 8px padding
  - p-4 = 16px padding
  - p-6 = 24px padding

  Typography

  - text-xs = 12px
  - text-sm = 14px
  - text-base = 16px
  - text-xl = 20px

  Responsive Design

  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3"
  // Mobile: 1 column
  // Tablet (md): 2 columns  
  // Desktop (lg): 5 columns

  ---
  Summary

  Design System: Custom design using Tailwind CSSProvider: Tailwind Labs (open-source
  framework)Maintenance:
  - Config in tailwind.config.js
  - Custom components in src/components/
  - Updated via npm
  - No external component library dependencies

  Philosophy: Utility-first, component-based, fully customizable, no opinionated design system
  constraints.