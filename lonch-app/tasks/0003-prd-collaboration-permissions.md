# PRD #0003: Collaboration & Permissions

**Feature Name:** Collaboration & Permissions
**PRD Number:** 0003
**Created:** 2025-10-16
**Status:** Draft

---

## 1. Introduction/Overview

This feature extends the lonch application to support multi-user collaboration on consulting projects with sophisticated permission controls. The system will enable consulting firms to invite both internal team members and client representatives to collaborate on projects while maintaining appropriate data boundaries and access controls.

The feature introduces a dual-group model where each project has two distinct groups: a **Consulting Group** (internal team) and a **Client Group** (client representatives). Combined with role-based permissions (Owner, Admin, Editor, Viewer), this provides granular control over who can see and modify project data.

**Problem Statement:** Currently, lonch projects are single-user only. Consulting firms need to collaborate internally and share appropriate project information with clients while keeping sensitive internal documents (e.g., strategy notes, pricing, internal communications) private from client view.

**Goal:** Enable secure, role-based collaboration on projects with dual-group architecture supporting both internal consulting team members and external client stakeholders.

---

## 2. Goals

1. **Enable Project Collaboration:** Allow project owners to invite users to collaborate on projects with defined roles and permissions
2. **Dual-Group Architecture:** Support separate Consulting Group and Client Group per project with different data visibility
3. **Role-Based Access Control:** Implement Owner/Admin/Editor/Viewer roles with appropriate permissions
4. **Activity Tracking:** Provide visibility into who made what changes and when
5. **Secure Invitation System:** Support multiple invitation methods (email, in-app, share links)
6. **Scalable Foundation:** Design system to support future dynamic group creation while starting with fixed 2-group model

---

## 3. User Stories

### Project Owner (Consulting Group)
- As a project owner, I want to invite internal consultants to my project so we can collaborate on client deliverables
- As a project owner, I want to invite client representatives so they can view progress and provide feedback
- As a project owner, I want to control what documents clients can see so I can keep internal strategy notes private
- As a project owner, I want to assign different roles to team members so I can delegate administrative tasks

### Consultant (Consulting Group - Admin/Editor)
- As a consultant admin, I want to manage team member access so I can onboard/offboard teammates
- As a consultant editor, I want to edit project content and see all internal documents
- As a consultant editor, I want to see activity logs so I know what clients have viewed or changed

### Client Representative (Client Group)
- As a client viewer, I want to see approved project deliverables so I can track progress
- As a client editor, I want to upload requirements documents so the consulting team has what they need
- As a client, I want to see only relevant project information without being overwhelmed by internal consultant discussions

### Viewer (Any Group)
- As a viewer, I want read-only access to assigned documents so I can stay informed without accidentally changing anything

---

## 4. Functional Requirements

### 4.1 Group Management
1. Each project MUST have exactly two groups: "Consulting Group" and "Client Group" (hardcoded for Phase 1)
2. Project owner MUST always be assigned to Consulting Group
3. Users MUST be assigned to exactly one group per project (cannot be in both)
4. Group assignment MUST be controlled by Owner or Admin roles only

### 4.2 Role-Based Permissions
5. System MUST support four roles: Owner, Admin, Editor, Viewer
6. **Owner** permissions:
   - Full access to all project data regardless of group visibility settings
   - Invite/remove users, assign roles and groups
   - Transfer project ownership to another Consulting Group member
   - Delete the project
7. **Admin** permissions:
   - Invite/remove users (except Owner), assign roles and groups
   - Edit project content within their group's visibility scope
   - Manage group-level data visibility settings
   - View activity logs
8. **Editor** permissions:
   - Edit project content within their group's visibility scope
   - Upload/modify documents visible to their group
   - Cannot manage users or permissions
9. **Viewer** permissions:
   - Read-only access to project content visible to their group
   - Cannot edit, upload, or modify anything
   - Can view activity logs for visible content

### 4.3 Data Visibility by Group + Role
10. Each document/data item MUST have a visibility setting: "Consulting Only", "Client Only", or "Both Groups"
11. Consulting Group members MUST be able to see documents marked "Consulting Only" or "Both Groups"
12. Client Group members MUST be able to see documents marked "Client Only" or "Both Groups"
13. Visibility settings MUST only be changeable by Owner or Admin roles
14. Default visibility for new documents uploaded by Consulting Group MUST be "Consulting Only"
15. Default visibility for new documents uploaded by Client Group MUST be "Both Groups"

### 4.4 Invitation System
16. System MUST support three invitation methods:
    - Email invitation (send email with invite link)
    - In-app invitation (search by email, send in-app notification)
    - Share link (generate shareable URL with embedded access token)
17. Invitations MUST specify: target project, assigned group (Consulting/Client), assigned role, expiration time
18. Invitation links MUST expire after 7 days if not accepted
19. Users MUST be able to accept/decline invitations
20. System MUST send email notification when invitation is sent (if user has email)
21. System MUST prevent duplicate invitations to the same email for the same project

### 4.5 Activity Logging
22. System MUST track and display user actions: document uploads, edits, deletions, permission changes, user invitations
23. Activity log entries MUST include: timestamp, user, action type, affected resource, group context
24. Activity logs MUST be visible to all project members based on data visibility rules (users only see logs for content they can access)
25. Activity log MUST be filterable by: user, action type, date range, group

### 4.6 User Management
26. Project settings page MUST display all project members with their group, role, and last activity
27. Owner/Admin MUST be able to change user roles within the same group
28. Owner/Admin MUST be able to move users between groups (Consulting ↔ Client)
29. Owner/Admin MUST be able to remove users from project (except cannot remove Owner)
30. System MUST prompt for confirmation before removing a user or changing ownership

### 4.7 Notifications (User-Configurable)
31. Users MUST be able to configure notification preferences: email-only, in-app-only, both, or none
32. System MUST notify users (per their preferences) for: project invitations, role changes, @mentions in comments, significant project updates
33. In-app notifications MUST appear in a notification center (bell icon) with unread badge
34. Email notifications MUST include direct link to relevant project/document

---

## 5. Non-Goals (Out of Scope for Phase 1)

- ❌ Dynamic group creation/deletion (fixed 2-group model only)
- ❌ Custom group names (always "Consulting Group" and "Client Group")
- ❌ Real-time collaborative editing (Google Docs-style)
- ❌ Real-time presence indicators (who's online/viewing)
- ❌ Comments/annotations on documents (future feature)
- ❌ Version history/rollback (future feature)
- ❌ Organization/workspace-level management (future feature)
- ❌ Billing/subscription management
- ❌ End-to-end encryption
- ❌ Offline collaboration support
- ❌ Mobile-optimized collaboration features
- ❌ Integration with external tools (Slack, Teams, etc.)

---

## 6. Design Considerations

### UI/UX Requirements
- Project settings page MUST have a "Team" or "Collaborators" tab showing all members
- Invitation modal MUST have clear group selection (Consulting vs Client) and role dropdown
- Document upload/edit interfaces MUST show visibility toggle: "Consulting Only", "Client Only", "Both Groups"
- User avatar/name displays MUST indicate group with subtle badge or color coding
- Activity log MUST be presented in a timeline/feed format with clear timestamps and action descriptions
- Notification center MUST use familiar bell icon with unread count badge

### Branding
- Continue using lonch color palette: Teal (#2D9B9B) primary, Gold (#DBA507) accent
- Group badges: Consulting Group = Teal, Client Group = Gold
- Maintain consistent "lonch" lowercase branding

---

## 7. Technical Considerations

### Database Schema
- **Collections needed:**
  - `projectMembers` (userId, projectId, group, role, invitedBy, joinedAt)
  - `invitations` (inviteId, projectId, email, group, role, token, expiresAt, status)
  - `activityLog` (logId, projectId, userId, action, resourceType, resourceId, timestamp, groupContext)
  - `userNotifications` (notificationId, userId, type, message, link, read, createdAt)

- **Firestore Security Rules:** Must enforce group-based visibility at database level
- **Project Document Schema:** Add `visibility` field to documents array items

### Dependencies
- Firebase Firestore (already integrated in PRD #0002)
- Firebase Auth (already integrated in PRD #0002)
- Email service (Firebase Extensions: Trigger Email or SendGrid integration)

### Integration Points
- Must integrate with existing AuthContext from PRD #0002
- Must extend existing projectService.js to handle multi-user projects
- Must update App.jsx to fetch and display projects user is a member of (not just owned projects)

### Performance Considerations
- Activity logs should be paginated (load 50 entries at a time)
- Project member lists should support search/filter for projects with many users
- Invitation tokens should be indexed for fast lookup

---

## 8. Success Metrics

1. **Adoption:** 70% of projects have at least 2 collaborators within 30 days of feature launch
2. **Engagement:** Average of 5 activity log entries per project per week
3. **Invitation Success:** 80% invitation acceptance rate within 7 days
4. **Group Usage:** At least 40% of projects have members in both Consulting and Client groups
5. **Data Security:** Zero incidents of unauthorized access to "Consulting Only" documents by Client Group members
6. **User Satisfaction:** 4+ star rating on collaboration features in user surveys

---

## 9. Open Questions

1. **Email Service:** Should we use Firebase Extensions (Trigger Email) or integrate a third-party service like SendGrid?
2. **Invitation Limits:** Should there be a maximum number of collaborators per project?
3. **Ownership Transfer:** Should system allow multiple owners per project, or enforce single owner always?
4. **Audit Trail:** How long should activity logs be retained? (30 days, 90 days, indefinitely?)
5. **Default Roles:** When a user is invited without specified role, what should the default be? (Suggest: Viewer)
6. **Cross-Project Visibility:** Should users be able to see which other projects their collaborators are working on?
7. **Notification Frequency:** Should digest emails be an option (daily/weekly summary instead of real-time)?
8. **Guest Access:** Should there be a "Guest" role with even more limited permissions than Viewer (e.g., single-document access)?

---

## 10. Phase Breakdown (Recommendation)

Given the complexity of dual-group federation and role-based permissions, I recommend a phased approach:

### Phase 1A: Core Permissions (Simpler MVP - Build This First)
- Basic role-based permissions (Owner, Admin, Editor, Viewer)
- Single project invitation system (email + in-app)
- Simple activity logging
- User can be invited to project with role assignment
- No group distinction yet (everyone sees everything)
- **Estimated:** 4-5 parent tasks, ~40 sub-tasks

### Phase 1B: Dual-Group Architecture (Full PRD #0003)
- Add Consulting Group vs Client Group distinction
- Implement group-based data visibility
- Group assignment in invitations
- Enhanced activity logs with group context
- Notification preferences
- Share links with group/role embedded
- **Estimated:** 5-6 parent tasks, ~50 sub-tasks

### Recommendation
I recommend building **Phase 1A first** as it's a natural stepping stone that delivers value quickly while setting up the foundation for dual-group architecture. Then iterate with Phase 1B to add the consulting/client separation.

**Does this phased approach work for you, or would you prefer to build the full dual-group system (Phase 1B) directly?**

---

## Appendix: Role Permission Matrix

| Action | Owner | Admin | Editor | Viewer |
|--------|-------|-------|--------|--------|
| View project content (within group visibility) | ✅ | ✅ | ✅ | ✅ |
| View ALL content (ignore group visibility) | ✅ | ❌ | ❌ | ❌ |
| Edit project content (within visibility) | ✅ | ✅ | ✅ | ❌ |
| Upload documents | ✅ | ✅ | ✅ | ❌ |
| Set document visibility (Consulting/Client/Both) | ✅ | ✅ | ❌ | ❌ |
| Invite users | ✅ | ✅ | ❌ | ❌ |
| Assign user groups | ✅ | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ✅ | ❌ | ❌ |
| Remove users | ✅ | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ | ❌ |
| View activity log | ✅ | ✅ | ✅ | ✅* |
| Generate share links | ✅ | ✅ | ❌ | ❌ |

*Viewers only see activity logs for content they have access to view
