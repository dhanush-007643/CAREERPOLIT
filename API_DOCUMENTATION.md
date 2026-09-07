# CareerPilot Backend REST API Documentation

Base URL: `http://localhost:5000/api`

All API responses follow the standard JSON envelope structure:

### Standard Success Response:
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

### Standard Paginated Response:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Standard Error Response:
```json
{
  "success": false,
  "message": "Error description message",
  "error": "ERROR_CODE",
  "details": [ ... ]
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new `FRESHER` or `STARTUP` user |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT token |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate session / client logout |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token |
| `POST` | `/api/auth/reset-password` | Public | Reset password with token |

---

## 2. Fresher Profile & Resume (`/api/freshers`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/freshers/profile` | Authenticated | Get current fresher profile with auto-computed completion percentage |
| `PUT` | `/api/freshers/profile` | FRESHER, ADMIN | Update education, skills, projects, experience, preferences |
| `POST` | `/api/freshers/resume` | FRESHER, ADMIN | Upload resume (`multipart/form-data`, file field: `resume`) |
| `DELETE` | `/api/freshers/resume` | FRESHER, ADMIN | Delete resume from Cloudinary and profile |

---

## 3. Companies & Follow System (`/api/companies`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/companies` | STARTUP, ADMIN | Create company profile |
| `GET` | `/api/companies` | Public | List and search public company directory |
| `GET` | `/api/companies/following` | Authenticated | Get companies followed by logged-in fresher |
| `GET` | `/api/companies/:id` | Public | Get company details |
| `PUT` | `/api/companies/:id` | STARTUP (Owner), ADMIN | Update company profile |
| `DELETE` | `/api/companies/:id` | STARTUP (Owner), ADMIN | Delete company profile |
| `POST` | `/api/companies/:id/follow` | FRESHER | Follow a company |
| `DELETE` | `/api/companies/:id/follow` | FRESHER | Unfollow a company |
| `GET` | `/api/companies/:id/followers` | Authenticated | Get company follower list |

---

## 4. Job Management & Search (`/api/jobs`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/jobs` | STARTUP, ADMIN | Post a new job (Public or Private) |
| `GET` | `/api/jobs` | Public | Search and filter jobs (`search`, `skills`, `location`, `workMode`, `experience`, `employmentType`, `page`, `limit`) |
| `GET` | `/api/jobs/:id` | Public (Private if authorized) | View job details |
| `PUT` | `/api/jobs/:id` | STARTUP (Owner), ADMIN | Update job posting |
| `DELETE` | `/api/jobs/:id` | STARTUP (Owner), ADMIN | Delete job posting |
| `POST` | `/api/jobs/:jobId/apply` | FRESHER | Apply for a job |
| `GET` | `/api/jobs/:jobId/applications` | STARTUP (Owner), ADMIN | View applicants for a job |

---

## 5. Applications & ATS Pipeline (`/api/applications` & `/api/company`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/applications/my` | FRESHER | View candidate's own submitted applications |
| `GET` | `/api/applications/:id` | Candidate, Owner Startup, ADMIN | View specific application details |
| `PATCH` | `/api/applications/:id/status` | STARTUP (Owner), ADMIN | Move application stage: `APPLIED` $\rightarrow$ `SHORTLISTED` $\rightarrow$ `INTERVIEW` $\rightarrow$ `SELECTED` / `REJECTED` |
| `GET` | `/api/company/pipeline` | STARTUP, ADMIN | Get full Kanban ATS pipeline grouped by stage |

---

## 6. Candidate Invitations (`/api/invitations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/invitations` | STARTUP, ADMIN | Directly invite a candidate for a job |
| `GET` | `/api/invitations` | Authenticated | List sent/received invitations |
| `PATCH` | `/api/invitations/:id/accept` | FRESHER | Candidate accepts company invitation |
| `PATCH` | `/api/invitations/:id/reject` | FRESHER | Candidate declines company invitation |

---

## 7. Interview Management (`/api/interviews`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/interviews` | STARTUP, ADMIN | Schedule interview (Date, Time, Meeting Link, Type: TECHNICAL/HR/CODING) |
| `GET` | `/api/interviews` | Authenticated | List interviews for current user |
| `PUT` | `/api/interviews/:id` | STARTUP, ADMIN | Reschedule or update interview notes |
| `DELETE` | `/api/interviews/:id` | STARTUP, ADMIN | Cancel scheduled interview |

---

## 8. Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Authenticated | Get notification feed with unread count |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark individual notification as read |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read |

---

## 9. AI Matching & Recommendations (`/api/matching` & `/api/recommendations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/matching/jobs` | FRESHER | Match fresher profile against all active public jobs |
| `GET` | `/api/matching/jobs/:jobId` | FRESHER | Calculate weighted match report, matched skills, missing skills, explanation for a specific job |
| `GET` | `/api/matching/candidates/:jobId` | STARTUP, ADMIN | Calculate match ranking for all registered candidates against a job |
| `GET` | `/api/recommendations/jobs` | FRESHER | Get top-ranked recommended jobs for fresher |
| `GET` | `/api/recommendations/candidates/:jobId` | STARTUP, ADMIN | Get top-ranked candidates for startup job with hiring explanations |

---

## 10. Career Development & Skill Assessments (`/api/career` & `/api/assessments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/career/profile` | FRESHER | View target career roles, readiness score, and assessment progress |
| `POST` | `/api/career/assessment` | FRESHER | Set target career goal and generate personalized roadmap |
| `GET` | `/api/career/skill-gap` | FRESHER | Calculate exact missing skills for target tech role |
| `GET` | `/api/career/roadmap` | FRESHER | Step-by-step milestone learning roadmap with courses & project ideas |
| `POST` | `/api/assessments` | ADMIN | Create skill assessment with multiple choice questions |
| `GET` | `/api/assessments` | Authenticated | List available skill assessments |
| `GET` | `/api/assessments/:id` | Authenticated | Get assessment details and test questions |
| `POST` | `/api/assessments/:id/submit` | FRESHER | Submit answers, calculate score, auto-verify skills |

---

## 11. Admin & Platform Analytics (`/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | ADMIN | Platform KPIs (Total Freshers, Startups, Jobs, Applications, Interviews, Selections, Avg Match Score) |
| `GET` | `/api/admin/analytics` | ADMIN | Comprehensive platform analytics |
| `GET` | `/api/admin/users` | ADMIN | View and search all registered users |
| `GET` | `/api/admin/companies` | ADMIN | View and search all companies |
| `GET` | `/api/admin/jobs` | ADMIN | View and manage all platform jobs |
| `GET` | `/api/admin/applications` | ADMIN | View and audit all platform applications |
