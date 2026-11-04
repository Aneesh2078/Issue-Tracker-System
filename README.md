# Exelon Circuits — Enterprise Issue Tracker System

> **Full-Stack Web Development Technical Assessment**  
> **Target Organization:** Exelon Circuits  
> **Repository:** [https://github.com/Aneesh2078/Issue-Tracker-System.git](https://github.com/Aneesh2078/Issue-Tracker-System.git)  
> **Frontend Live Demo:** `https://issue-tracker-system-exelon.vercel.app` *(or custom Vercel domain)*  
> **Backend Production API:** `https://issue-tracker-backend-production.up.railway.app` *(or custom Railway domain)*  

---

## 1. Project Title & Overview

The **Exelon Circuits Issue Tracker System** is an enterprise-grade, internal issue and defect management web application built from scratch to streamline engineering, hardware defect reporting, and workflow tracking. Designed with clean, utilitarian aesthetics reminiscent of high-productivity tools like Jira, the system delivers role-based access control (RBAC), end-to-end auditability, real-time metrics, automated issue indexing, and threaded collaboration.

---

## 2. Problem Statement

Engineering teams at high-reliability electronics manufacturers like Exelon Circuits manage complex multi-stage PCB fabrication, circuit testing, and firmware deployment. Without a unified, role-governed issue tracking system:
- Hardware bugs and test failures are dispersed across email chains and chat channels.
- Priority assignments lack transparent status visibility, resulting in bottlenecked quality assurance.
- Normal developers often lack clear queues for tickets assigned to them versus tickets they reported.
- Administrative oversight cannot reliably calculate organizational resolution metrics or maintain strict audit compliance.

This application resolves these challenges with structured issue lifecycles, clear ownership delegation, and database-driven analytics.

---

## 3. Key Features

- **Robust Role-Based Access Control (RBAC):** Distinct permissions for `ADMIN` and `USER` roles enforced securely at the Express API layer and reflected in the React UI.
- **Automated Sequential Issue Keying:** Auto-generates unique sequential identifiers (e.g., `EX-1001`, `EX-1002`) for human-readable tracking.
- **Complete Issue Lifecycle (CRUD):** Create, view, edit, reassign, filter, sort, paginate, and track issues through `Open`, `In Progress`, and `Closed` states.
- **Interactive Discussion & Comments:** Chronological threaded commentary on every ticket with author attribution and deletion control.
- **Dynamic Analytics Dashboard:** Live calculation of system-wide (Admin) and personal (User) statistics with Recharts visualizations directly from MongoDB records.
- **Administrative User Directory:** Admin portal to search team members, filter by role, monitor assigned workload counts, and safely toggle account activation.
- **Simple, Professional UI/UX:** Jira-inspired design strictly adhering to the specified palette (#2563EB primary, #F8FAFC page background, subtle borders, no unnecessary clutter).
- **Responsive Architecture:** Fully mobile-friendly layout with collapsible sidebar, sticky top navigation, accessible modals, and toast feedback.

---

## 4. User Roles & Permission Matrix

| Capability / Action | Admin | Normal User |
| :--- | :---: | :---: |
| Self-Registration (`POST /api/auth/register`) | Creates `USER` | Creates `USER` |
| View System Dashboard (All Issues Stats) | Yes | No (Personal Stats Only) |
| View All Issues in Organization | Yes | Only Created / Assigned |
| Create New Issues | Yes | Yes |
| Edit Issue Details (Title, Description, Priority) | Any Issue | Created by Self Only |
| Assign / Reassign Issues to Team Members | Yes | No |
| Change Issue Status (`Open`, `In Progress`, `Closed`) | Any Issue | Issues Assigned to Self |
| Delete Issues and Related Discussions | Yes | No |
| Post Comments on Tickets | Yes | Permitted Tickets |
| Delete Comments | Any Comment | Own Comments Only |
| Manage User Directory (Activate / Deactivate) | Yes | No |

---

## 5. Technology Stack

### Frontend
- **Framework:** React 18 with Vite build tooling
- **Styling:** Tailwind CSS (customized with corporate palette)
- **Routing:** React Router DOM v6 (declarative SPA routing with nested layouts and route guards)
- **HTTP Client:** Axios (centralized client with JWT request/response interceptors)
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **State Management:** React Context API (`AuthContext`, `ToastContext`)

### Backend
- **Runtime & Framework:** Node.js (v18+) with Express.js
- **Architecture:** RESTful API with Controller-Service-Model layering
- **Authentication:** JSON Web Tokens (JWT) with HMAC SHA-256 signatures
- **Password Security:** bcryptjs (10 salt rounds)
- **Validation & Sanitization:** express-validator
- **Cross-Origin Resource Sharing:** CORS with dynamic origin whitelisting
- **Environment Management:** dotenv

### Database
- **Engine:** MongoDB (Atlas Cloud in production / local MongoDB in dev)
- **Object Data Modeling (ODM):** Mongoose v8 with schema validation, compound indexes, and pre-save hooks

---

## 6. System Architecture

```
                                    +-----------------------------------------+
                                    |               Web Browser               |
                                    |  (React 18 + Vite + Tailwind CSS SPA)   |
                                    +--------------------+--------------------+
                                                         |
                                            HTTPS / REST | (Bearer JWT)
                                                         v
                                    +-----------------------------------------+
                                    |             Railway Backend             |
                                    |         (Node.js + Express API)         |
                                    +----+-------------------------------+----+
                                         |                               |
                   Mongoose Connection   |                               | Auth & RBAC Middleware
                                         v                               v
            +-----------------------------------------+     +--------------------------+
            |          MongoDB Atlas Cluster          |     |  express-validator & JWT |
            |  (Collections: users, issues, comments) |     +--------------------------+
            +-----------------------------------------+
```

---

## 7. Folder Structure

```
issue-tracker/
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConfirmationDialog.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── FilterDropdown.jsx
│   │   │   │   ├── LoadingState.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── PriorityBadge.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── StatisticsCard.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   └── ToastNotification.jsx
│   │   │   └── issues/
│   │   │       ├── AssignUserModal.jsx
│   │   │       ├── CommentSection.jsx
│   │   │       └── IssueTable.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useToast.js
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AllIssues.jsx
│   │   │   ├── AssignedIssues.jsx
│   │   │   ├── CreateIssuePage.jsx
│   │   │   ├── EditIssuePage.jsx
│   │   │   ├── IssueDetailsPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyIssues.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   └── UserManagementPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── commentService.js
│   │   │   ├── dashboardService.js
│   │   │   ├── issueService.js
│   │   │   └── userService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── dashboardController.js
│   │   ├── issueController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Issue.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── issueRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── services/
│   │   └── issueNumberService.js
│   ├── utils/
│   │   └── token.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── BRD.md
├── package.json
└── README.md
```

---

## 8. Database Schema & Data Models

### User Model (`backend/models/User.js`)
```javascript
{
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 }, // Bcrypt hashed
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

### Issue Model (`backend/models/Issue.js`)
```javascript
{
  issueNumber: { type: String, required: true, unique: true, trim: true }, // e.g. EX-1001
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: Date,
  updatedAt: Date
}
```
*Indexes:* `{ issueNumber: 1 }` (unique), `{ status: 1 }`, `{ priority: 1 }`, `{ createdBy: 1 }`, `{ assignedTo: 1 }`, `{ createdAt: -1 }`, and text index on `{ title: 'text', description: 'text' }`.

### Comment Model (`backend/models/Comment.js`)
```javascript
{
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 9. API Documentation

### Health Endpoint
- `GET /api/health` — Public health check providing database connection state, server uptime, and timestamp.

### Authentication Endpoints
- `POST /api/auth/register` — Registers a new user. Always assigns `role: 'user'`.
- `POST /api/auth/login` — Authenticates credentials, verifies active status, and returns a signed JWT.
- `GET /api/auth/me` — Protected route returning the authenticated user profile.

### Issue Endpoints
- `GET /api/issues` — Retrieves issues with search (`search`), filters (`status`, `priority`, `assignee`, `scope=my|assigned`), sorting (`sort`), and pagination (`page`, `limit`).
- `POST /api/issues` — Creates a new issue with auto-generated sequential `issueNumber`.
- `GET /api/issues/:id` — Fetches full issue details with populated creator and assignee.
- `PUT /api/issues/:id` — Updates issue fields (title, description, priority). Admins can also update status and assignee.
- `DELETE /api/issues/:id` — Admin only. Permanently deletes the issue and all associated comments.
- `PUT /api/issues/:id/assign` — Admin only. Updates `assignedTo` user.
- `PATCH /api/issues/:id/status` — Updates status (`Open`, `In Progress`, `Closed`). Permitted for Admin or the assigned user.

### Comment Endpoints
- `GET /api/issues/:id/comments` — Fetches all comments for an issue in chronological order.
- `POST /api/issues/:id/comments` — Appends a comment to an issue.
- `DELETE /api/comments/:id` — Deletes comment. Permitted for comment author or Admin.

### User Management Endpoints
- `GET /api/users` — Admin only. Returns directory of users with computed `assignedIssuesCount`.
- `GET /api/users/:id` — Admin only. Retrieves user details and metrics.
- `PATCH /api/users/:id/status` — Admin only. Toggles user account activation (`isActive: true/false`).

### Dashboard Endpoints
- `GET /api/dashboard/stats` — Calculates real-time card counts (`total`, `open`, `inProgress`, `closed`), priority distributions, and status distribution.
- `GET /api/dashboard/recent-issues` — Retrieves the 6 latest issues for the user/admin.

---

## 10. Prerequisites

Make sure the following tools are installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas connection string or local MongoDB instance (v6+)
- **Git**

---

## 11. Local Installation & Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/Aneesh2078/Issue-Tracker-System.git
cd Issue-Tracker-System
```

### Step 2: Install Dependencies
Install all backend and frontend dependencies using root convenience script:
```bash
npm run install:all
```
*Or install independently:*
```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Step 3: Configure Environment Variables

**Backend Environment Setup:**
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Populate `backend/.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/issue_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_random_key_min_32_characters
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@exelon.com
ADMIN_PASSWORD=AdminPass@123
ADMIN_NAME=System Administrator
NODE_ENV=development
```

**Frontend Environment Setup:**
Create a `.env` file in the `frontend/` directory:
```bash
cp frontend/.env.example frontend/.env
```
Populate `frontend/.env` with:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 12. Seed Administrator Account

Run the administrative seed script to initialize or update the initial admin user using the credentials defined in `backend/.env`:
```bash
npm run seed
# Or from backend directory:
cd backend && npm run seed
```
**Default Seed Credentials:**
- **Email:** `admin@exelon.com`
- **Password:** `AdminPass@123`
- **Role:** `admin`

---

## 13. Running the Application Locally

Start both backend and frontend servers in separate terminal sessions:

### Terminal 1: Backend API Server
```bash
cd backend
npm run dev
```
*The server will start on [http://localhost:5000](http://localhost:5000).*  
*Test health check:* [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Terminal 2: Frontend Development Client
```bash
cd frontend
npm run dev
```
*The React client will launch at [http://localhost:5173](http://localhost:5173).*

---

## 14. Testing Instructions

### Verification Matrix
1. **User Self-Registration:** Navigate to `/register`, enter valid details. Verify successful redirect to `/dashboard`.
2. **Duplicate Email Prevention:** Attempt to register with the same email. Confirm friendly error toast.
3. **Role Enforcement:** Inspect created user in MongoDB; verify `role` is strictly `user`.
4. **Admin Login:** Log in using `admin@exelon.com` / `AdminPass@123`. Verify access to `/admin-dashboard` and `/users`.
5. **Issue Creation:** File a new issue. Observe sequential issue key generation (`EX-1001`).
6. **Issue Assignment:** As Admin, assign the issue to the created normal user.
7. **Normal User View:** Log in as the normal user. Navigate to `/issues/assigned`. Verify the assigned ticket is visible.
8. **Status Progression:** As the assigned user, update status from `Open` to `In Progress`, then `Closed`.
9. **Comments Collaboration:** Post comments from both accounts. Verify chronological ordering and avatar badges.
10. **Admin Deletion:** As Admin, delete a test ticket. Confirm ticket and associated comments are wiped.
11. **User Account Status:** In Admin `/users`, deactivate a user. Attempt to login with that user; verify immediate rejection with 403 Forbidden.

---

## 15. Cloud Deployment Guide

### A. Database Deployment (MongoDB Atlas)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g., M0).
3. Under **Database Access**, create a user (e.g., `exelon_admin`) with read/write privileges.
4. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) to permit cloud backend connections from Railway.
5. In your cluster dashboard, click **Connect** -> **Drivers** and copy the URI string.

### B. Backend Deployment (Railway)
1. Sign in to [Railway](https://railway.com/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `Issue-Tracker-System`.
4. In the service settings:
   - **Root Directory:** Set to `/backend`.
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Variables**, configure:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_production_jwt_secret
   CLIENT_URL=https://your-frontend.vercel.app
   ADMIN_EMAIL=admin@exelon.com
   ADMIN_PASSWORD=your_secure_password
   NODE_ENV=production
   ```
6. Under **Networking**, generate a public Railway domain (e.g., `https://issue-tracker-backend-production.up.railway.app`).
7. Verify health: visit `https://your-backend.up.railway.app/api/health`.

### C. Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** -> Import `Issue-Tracker-System`.
3. In Project Settings:
   - **Root Directory:** Select `frontend`.
   - **Framework Preset:** Vite.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**:
   ```env
   VITE_API_URL=https://your-railway-backend.up.railway.app/api
   ```
5. Deploy. `vercel.json` ensures all SPA routes (`/issues`, `/login`, etc.) resolve properly without 404 errors.

---

## 16. Maintenance & Redeployment

Any changes committed to the `main` branch automatically trigger automated deployments:
- **Railway** watches `/backend` and performs zero-downtime rolling deploys.
- **Vercel** triggers an optimized static rebuild and propagates assets via global edge CDN.

---

## 17. License & Credits

Developed by **Aneesh2078** for the **Exelon Circuits Technical Assessment**. All rights reserved.

