# PRD #0004: Shareable Invite Links

**Feature Name:** Shareable Invite Links
**PRD Number:** 0004
**Created:** 2025-10-21
**Status:** Draft
**Extends:** PRD #0003 (Collaboration & Permissions)

---

## 1. Introduction/Overview

This feature adds shareable invite links to the lonch collaboration system, complementing the existing email and in-app invitation methods. Users can generate unique, tokenized URLs that grant project access with pre-configured role and group assignments.

**Problem Statement:** Currently, users can only invite collaborators via email addresses (email invitations from PRD #0003). This creates friction when:
- Inviting multiple people from the same organization
- Sharing access in team meetings or chat channels (Slack, Teams)
- Onboarding clients who prefer self-service access
- Working with users whose email addresses are unknown

**Goal:** Enable any project member to generate secure, single-use shareable links that grant immediate project access with pre-configured permissions, while maintaining the same security and group/role controls as the existing invitation system.

---

## 2. Goals

1. **Frictionless Sharing:** Allow project members to generate and share invitation links without requiring email addresses
2. **Security:** Maintain role-based and group-based access control with expiring, single-use tokens
3. **Flexibility:** Support all role/group combinations (Owner/Admin/Editor/Viewer × Consulting/Client)
4. **Transparency:** Show link creator information and log all link acceptances for audit trails
5. **User-Friendly:** Provide simple copy-to-clipboard functionality and clear link management UI
6. **Consistency:** Align link expiration and security patterns with existing email invitation system

---

## 3. User Stories

### As a project member (any role):
- I want to generate a shareable invite link so that I can invite someone without knowing their email address
- I want to copy the link to my clipboard so that I can easily paste it into Slack, Teams, or other communication tools
- I want to choose the role and group when generating the link so that the recipient gets appropriate permissions
- I want to see all active links I've created so that I can revoke them if needed

### As a project owner/admin:
- I want to see all active invite links for my project so that I can manage and revoke access
- I want to see who created each link so that I can maintain accountability
- I want to see link acceptance activity in the activity log so that I can track who joined via links

### As a link recipient:
- I want to click a shareable link and be prompted to log in or sign up so that I can quickly join the project
- I want to see who created the link and what role/group I'll be assigned so that I understand what access I'm getting
- I want clear feedback if the link has expired or is invalid so that I can request a new one

### As a security-conscious admin:
- I want links to expire after 7 days so that old links can't be used indefinitely
- I want links to be single-use so that sharing a link doesn't create unlimited access
- I want to revoke individual links so that I can control access even before expiration

---

## 4. Functional Requirements

### 4.1 Link Generation

1. The system MUST allow any authenticated project member to generate shareable invite links
2. The system MUST require the link creator to select a target role (Owner, Admin, Editor, Viewer) when generating a link
3. The system MUST require the link creator to select a target group (Consulting Group, Client Group) when generating a link
4. The system MUST generate a unique, cryptographically secure token for each link (minimum 32 characters)
5. The system MUST set link expiration to 7 days from creation time
6. The system MUST mark links as single-use (link becomes invalid after first acceptance)
7. The system MUST store link metadata: token, projectId, role, group, createdBy, createdAt, expiresAt, status (active/used/revoked)

### 4.2 Link Sharing

8. The system MUST generate a full URL in format: `https://lonch.app/invite/{token}`
9. The system MUST provide a "Copy Link" button that copies the URL to clipboard
10. The system MUST display the generated link in a text field for manual copying as fallback
11. The system MUST show link details after generation: role, group, expiration date, creator

### 4.3 Link Acceptance

12. The system MUST require users to be logged in before accepting invite links (redirect to login/signup if not authenticated)
13. The system MUST display link details on acceptance page: project name, role to be assigned, group to be assigned, link creator name
14. The system MUST validate link token against database (check exists, not expired, not used, not revoked)
15. The system MUST add user to project with specified role and group upon acceptance
16. The system MUST mark link as "used" and record acceptedBy userId and acceptedAt timestamp
17. The system MUST redirect user to project dashboard after successful acceptance
18. The system MUST show clear error messages for invalid scenarios: link expired, link already used, link revoked, link not found

### 4.4 Link Management

19. The system MUST provide a "Share Links" tab in the ProjectMembersPanel
20. The system MUST display all active invite links for the project in a table format with columns: Role, Group, Created By, Created Date, Expires, Status, Actions
21. The system MUST allow any user to see links they created
22. The system MUST allow Owner/Admin to see all links for the project
23. The system MUST provide a "Revoke" button for each active link (available to link creator or Owner/Admin)
24. The system MUST prompt for confirmation before revoking a link
25. The system MUST update link status to "revoked" when revoked (do not delete from database)
26. The system MUST provide a "Generate New Link" button that opens link creation modal

### 4.5 Activity Logging

27. The system MUST log activity when a link is created: action="invite_link_created", metadata includes role, group, token (last 8 chars only)
28. The system MUST log activity when a link is accepted: action="invite_link_accepted", metadata includes new member email, role, group, link creator
29. The system MUST log activity when a link is revoked: action="invite_link_revoked", metadata includes role, group, revoked by
30. All link-related activity MUST be visible in the Activity Log Panel with appropriate group context

### 4.6 Security & Validation

31. The system MUST validate link expiration on every acceptance attempt (reject if current time > expiresAt)
32. The system MUST validate link status (reject if status is "used" or "revoked")
33. The system MUST validate that link token exists in database before acceptance
34. The system MUST prevent users from accepting a link for a project they are already a member of (show friendly message: "You're already a member of this project")
35. The system MUST use HTTPS for all invite link URLs in production

---

## 5. Non-Goals (Out of Scope)

This feature will **not** include:

1. ❌ Multi-use links (each link is single-use only in Phase 1)
2. ❌ Custom link expiration times (always 7 days in Phase 1)
3. ❌ Link analytics (click tracking, view counts)
4. ❌ QR code generation for links
5. ❌ Email notifications when someone uses a link (only activity log entry)
6. ❌ Link password protection or additional authentication layers
7. ❌ Public/anonymous access links (all links require login)
8. ❌ Bulk link generation
9. ❌ Link templates or presets
10. ❌ Integration with external link shorteners (bit.ly, etc.)

---

## 6. Design Considerations

### UI/UX Requirements

#### Link Generation Modal
- Modal title: "Generate Shareable Invite Link"
- Role dropdown: Owner, Admin, Editor, Viewer (with tooltips explaining each)
- Group radio buttons: "Consulting Group" (teal accent) / "Client Group" (gold accent)
- Preview section showing: "Recipients will join as [Role] in [Group]"
- "Generate Link" button (teal background)
- After generation:
  - Display full URL in read-only text input
  - "Copy Link" button next to URL (gold accent)
  - Expiration notice: "This link expires in 7 days (Oct 28, 2025 at 3:45 PM)"
  - Creator notice: "Created by you"

#### Share Links Tab (in ProjectMembersPanel)
- Tab label: "Share Links" with count badge (e.g., "Share Links (3)")
- Table columns:
  - Role (with RoleBadge component)
  - Group (with GroupBadge component)
  - Created By (user avatar + name)
  - Created (relative time: "2 days ago")
  - Expires (relative time or date)
  - Status (Active/Used/Expired/Revoked with color coding)
  - Actions (Revoke button for active links)
- Empty state: "No invite links yet. Generate one to get started."
- "Generate New Link" button (prominent, teal background)

#### Link Acceptance Page
- Centered card layout with gradient background (consistent with login/signup pages)
- lonch logo at top
- Project name (large, bold)
- Invitation details:
  - "You've been invited by [Creator Name]"
  - "You will join as: [RoleBadge] [GroupBadge]"
- "Accept Invitation" button (teal, prominent)
- "Decline" link (subtle, gray)
- If not logged in: show "Log in or Sign up to accept this invitation" message

### Branding
- Use lonch color palette: Teal (#2D9B9B) for primary actions, Gold (#DBA507) for copy button
- Maintain lowercase "lonch" branding
- Group badges: Consulting Group = Teal, Client Group = Gold
- Role badges: existing color scheme from Phase 1A

---

## 7. Technical Considerations

### Database Schema

**New Collection: `inviteLinks`**
```
inviteLinks (collection)
  └─ {linkId} (document)
      ├─ token: string (unique, indexed)
      ├─ projectId: string (indexed)
      ├─ role: "owner" | "admin" | "editor" | "viewer"
      ├─ group: "consulting" | "client"
      ├─ createdBy: string (userId)
      ├─ createdAt: timestamp
      ├─ expiresAt: timestamp (indexed for cleanup queries)
      ├─ status: "active" | "used" | "revoked"
      ├─ acceptedBy: string? (userId, populated when used)
      └─ acceptedAt: timestamp? (populated when used)
```

### Token Generation
- Use `crypto.randomBytes(32).toString('hex')` or Firebase equivalent
- Ensure uniqueness with database check before creation
- Index token field for fast lookup

### URL Structure
- Development: `http://localhost:5173/invite/{token}`
- Production: `https://lonch.app/invite/{token}` (or actual production domain)

### Firestore Security Rules
- Read access: authenticated users only
- Write access:
  - Create: any project member
  - Update (revoke): link creator or project Owner/Admin
  - Delete: Owner only

### API/Service Functions (to create in `inviteLinkService.js`)
- `generateInviteLink(projectId, role, group, createdBy)` → returns link object with full URL
- `getInviteLink(token)` → returns link object or null
- `getProjectInviteLinks(projectId, userId, userRole)` → returns links (filtered by permissions)
- `acceptInviteLink(token, userId)` → validates and adds user to project
- `revokeInviteLink(linkId, revokedBy)` → marks link as revoked
- `cleanupExpiredLinks()` → background job to mark expired links (optional)

### Integration Points
- Extends existing `invitationService.js` patterns from PRD #0003
- Reuses `projectService.js` `addProjectMember()` function
- Reuses `activityLogService.js` for logging
- Reuses `RoleBadge` and `GroupBadge` components from Phase 1A/1B
- Adds new route in `App.jsx`: `/invite/:token`

### Performance Considerations
- Index token field for O(1) lookup
- Index expiresAt for efficient cleanup queries
- Limit query for active links (paginate if project has 100+ links)

---

## 8. Success Metrics

1. **Adoption:** 40%+ of projects generate at least one shareable link within 30 days of feature launch
2. **Usage:** 20%+ of new project members join via shareable links (vs email invitations)
3. **Link Success Rate:** 85%+ of generated links are successfully accepted before expiration
4. **Security:** Zero incidents of expired or revoked links granting unauthorized access
5. **User Satisfaction:** Positive feedback on ease of sharing vs email invitations
6. **Performance:** Link acceptance page loads in <2 seconds
7. **Revocation Usage:** <5% of generated links are revoked (indicates good targeting)

---

## 9. Open Questions

1. **Link Cleanup:** Should we auto-delete expired/used links after 90 days to reduce database clutter, or keep them indefinitely for audit trails?
   - **Recommendation:** Keep for 90 days for audit, then auto-archive or delete

2. **Copy Feedback:** Should we add visual feedback when link is copied (toast notification)?
   - **Recommendation:** Yes, subtle toast message "Link copied to clipboard!"

3. **Link Preview:** Should we provide a "Preview" button that shows what the acceptance page looks like before sharing?
   - **Recommendation:** Defer to future enhancement

4. **Mobile Experience:** Should we optimize the Share Links tab for mobile (drawer vs tabs)?
   - **Recommendation:** Yes, use responsive design with stacked layout on mobile

5. **Link Regeneration:** Should we allow users to regenerate an expired link with same role/group settings?
   - **Recommendation:** Yes, add "Regenerate" button next to expired links

6. **Notification:** Should link creator get in-app notification when their link is accepted?
   - **Recommendation:** Yes, but only if creator has notifications enabled for "member joined" events

---

## 10. Implementation Phases

This feature can be built as a single phase:

### Phase 1: Complete Shareable Links (This PRD)
- Link generation with role/group selection
- Share Links tab in ProjectMembersPanel
- Link acceptance page with validation
- Activity logging for all link actions
- Revocation functionality
- **Estimated:** 3-4 parent tasks, ~30-35 sub-tasks

### Future Enhancements (Out of Scope)
- Multi-use links with usage limits
- Custom expiration times
- Link analytics and click tracking
- QR code generation
- Email notifications on link acceptance

---

## Appendix: Link States and Transitions

| State | Description | Can Accept? | Visible in UI? |
|-------|-------------|-------------|----------------|
| **active** | Newly created, not yet used | ✅ Yes (if not expired) | ✅ Yes |
| **used** | Someone accepted the link | ❌ No | ✅ Yes (for audit) |
| **revoked** | Manually revoked by creator/admin | ❌ No | ✅ Yes (for audit) |
| **expired** | Past expiresAt timestamp | ❌ No | ✅ Yes (for audit) |

**Transition Rules:**
- `active` → `used` (when someone accepts link)
- `active` → `revoked` (when creator/admin revokes)
- `active` → `expired` (automatic when current time > expiresAt)
- States are final (no transitions from used/revoked/expired back to active)

---

*This PRD is ready for task generation. Once approved, proceed to `generate-tasks.md` to create the implementation task list.*
