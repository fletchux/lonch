# Lonch - Client Project Management Platform

A modern web application for managing consulting client projects with AI-powered document extraction, team collaboration, and group-based permissions.

## Features

### 🚀 Project Management
- **Wizard-driven project creation** - Template-based setup for client intake, deliverables, stakeholders, and team structure
- **AI-powered document extraction** - Upload contracts/specs and auto-populate project details using Claude API
- **Document management** - Upload, categorize, download, and delete project documents with bulk operations

### 👥 Collaboration & Permissions (Phase 1B - In Progress)
- **Dual-group architecture** - Separate Consulting and Client groups with distinct access levels
- **Role-based access control** - Owner, Admin, Editor, and Viewer roles with granular permissions
- **Group-based document visibility** - Control which documents are visible to Consulting, Client, or Both groups
- **Team management** - Invite users to specific groups, manage roles, and move members between groups
- **Activity logging** - Track all project changes with group context

### 🎨 User Experience
- **Modern UI** - Built with React and Tailwind CSS for a clean, responsive design
- **Real-time updates** - Firebase integration for live data synchronization
- **Visual indicators** - Color-coded badges for groups (Teal=Consulting, Gold=Client) and roles

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **AI:** Anthropic Claude API for document extraction
- **Testing:** Vitest, React Testing Library
- **Code Quality:** ESLint

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fletchux/lonch.git
cd lonch/lonch-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID
- `VITE_ANTHROPIC_API_KEY` - Your Anthropic API key for document extraction

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Run tests in watch mode
npm test -- <file>    # Run specific test file
```

### Building for Production

```bash
npm run build         # Build for production
npm run preview       # Preview production build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── icons/          # Icon components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── pages/          # Page components (Home, Wizard, ProjectDashboard)
│   ├── project/        # Project-specific components (members, activity, documents)
│   └── shared/         # Shared UI components (badges, modals)
├── contexts/           # React contexts (AuthContext)
├── data/              # Static data (templates)
├── hooks/             # Custom React hooks
├── services/          # Business logic and API calls
│   ├── projectService.js        # Project CRUD operations
│   ├── invitationService.js     # User invitation system
│   ├── activityLogService.js    # Activity tracking
│   └── documentExtraction.js    # AI document processing
└── utils/             # Utility functions and helpers
```

## Development Workflow

See [.github/WORKFLOWS.md](.github/WORKFLOWS.md) for detailed development workflows including:
- **"lonchit"** - Wrap up and ship workflow
- **"Quick Commit"** - For small changes
- **"Feature Review"** - Pre-PR review process

## Current Status

**Phase 1B: Dual-Group Architecture** (65% complete)
- ✅ Database schema with group support
- ✅ Group-based permission system
- ✅ Invitation system with group assignment
- ✅ Group management UI components
- ✅ Document visibility controls
- 🚧 Activity logs with group context
- 🚧 Notification system
- 🚧 Comprehensive testing

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and [tasks/](tasks/) for development roadmap.

## Contributing

This project is developed with Claude Code. See [CLAUDE.md](CLAUDE.md) for AI-assisted development workflows.

## License

Proprietary - All rights reserved
