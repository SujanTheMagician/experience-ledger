# Product Requirements Document (PRD)

## Experience Ledger

### 1. Problem Statement

Students accumulate real, valuable experience through internships and academic
projects, but today this evidence lives nowhere reliable — resumes, personal
spreadsheets, and scattered chat groups. None of it is verified. Faculty
mentors have no structured way to confirm a student's claims, and placement
cells / department administrators have no aggregate view of cohort-wide skill
trends or placement readiness. Every stakeholder is working from incomplete,
unverifiable, and unstructured information.

### 2. Goal

Build a centralized web platform where:
- Students log internships and projects in a consistent, structured format.
- Faculty mentors review and verify each submission, turning a self-reported
  claim into an institutionally validated record.
- Placement officers and admins see real, aggregated analytics (not
  spreadsheets) — skill trends, placement readiness, cohort-level insight.

### 3. Stakeholders / User Roles

| Role | Description | Primary Needs |
|---|---|---|
| **Student** | Logs their own internships/projects | Easy submission, evidence upload, status tracking |
| **Mentor** | Faculty reviewer assigned to students | Queue of pending submissions, approve/reject/request changes with comments |
| **Placement Officer** | Cell staff planning placements | Aggregate analytics: readiness %, skill trends, organizations |
| **Admin** | Platform/institution administrator | User management, role assignment, full visibility |

### 4. Core Features (by role)

**Student**
- Register / log in (email+password or Google Sign-In)
- Submit an experience: type (internship/project), organization, role,
  duration, description, outcome, optional evidence link/file
- Upload evidence file (PDF/JPG/PNG, max 10MB)
- View own submissions and their verification status
- Delete own (unverified) submissions

**Mentor**
- View a review queue of submitted experiences
- Approve, reject, or request changes, with a comment
- (Reviewer permissions also extend to Placement Officer and Admin roles)

**Placement Officer / Admin**
- View analytics dashboard: verified experience count, average mentor
  review time, placement-readiness percentage, organization count,
  submission trend over time, per-student cohort breakdown

**Admin only**
- List all users
- Change a user's role (student / mentor / placement_officer / admin)

### 5. Verification Workflow

Every submitted experience starts as **Pending Verification**. A
mentor/placement officer/admin transitions it to **Approved**, **Rejected**,
or **Changes Requested**, optionally with a comment. Only verified
(Approved) experiences count toward a student's "placement-ready" metrics.

### 6. Non-Functional Requirements

- **Security**: passwords hashed (bcrypt), stateless JWT auth (7-day expiry),
  role-based access control on every protected route, admin role can never
  be self-assigned through public registration.
- **Data integrity**: role and status values are constrained at the
  database level (not just in application code).
- **Usability**: responsive layout (desktop + mobile), clear empty/error
  states.
- **Portability**: fully containerized (Docker) for consistent deployment.

### 7. Out of Scope (current version)

- Automated/third-party verification of evidence authenticity
- Notifications delivery (email/SMS) — schema exists, delivery does not
- Multi-institution / multi-tenant support

### 8. Success Metrics

- % of submitted experiences reviewed within a target turnaround time
- % of students with at least one verified experience
- Adoption across at least one full student cohort and their mentors
