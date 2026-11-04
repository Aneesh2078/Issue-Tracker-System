# 🛠️ Exelon Circuits — Issue Tracker System

> A full-stack issue tracking application built for **Exelon Circuits** as part of a technical assessment. Modelled after Jira, it provides role-based access control (RBAC), real-time dashboard analytics, comment threads, and complete issue lifecycle management.

---

## 📸 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (7-day tokens), bcrypt password hashing |
| **API** | RESTful JSON API |
| **State** | React Context API |
| **HTTP Client** | Axios (with interceptors) |

---

## ✨ Features

### 🔐 Authentication & Security
- Register / Login with JWT tokens stored in `localStorage`
- Public registration always creates a `user` role — **admin can only be created via seed script**
- Backend enforces all permission checks (never trusts the frontend)
- Passwords hashed with bcrypt (salt rounds: 10)

### 👤 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full CRUD on all issues, assign issues to users, manage users (activate/deactivate), view all analytics |
| **User** | Create issues, view own issues, view issues assigned to them, add comments |

### 📋 Issue Management
- Auto-incremented issue numbers: `EX-1001`, `EX-1002`, …
- Priority levels: **Critical**, **High**, **Medium**, **Low**
- Status workflow: **Open → In Progress → Closed**
- Assign issues to any registered user (admin only)
- Full-text search and filter by status/priority

### 📊 Dashboard Analytics
- Total issues, open count, in-progress count, closed count
- Priority breakdown
- Recent activity feed

### 💬 Comments
- Threaded comments on each issue
- Comment authors see a delete button for their own comments
- Admins can delete any comment

### 👥 User Management (Admin)
- List all registered users
- Activate / deactivate accounts
- Deactivated users cannot log in

---

## 🗂️ Folder Structure

```
Issue Tracker System/
├── backend/
│   ├── config/
│   │   └── db.js                   # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── dashboardController.js
│   │   ├── issueController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # protect, adminOnly
│   │   ├── errorMiddleware.js       # notFound, errorHandler
│   │   └── validationMiddleware.js  # express-validator chains
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
│   │   ├── seedAdmin.js             # seed admin user only
│   │   └── seedCompleteData.js      # seed all demo data
│   ├── services/
│   │   └── issueNumberService.js    # EX-XXXX auto-increment
│   ├── utils/
│   │   └── token.js                 # JWT signing helper
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── contexts/               # AuthContext, ToastContext
│   │   ├── hooks/                  # useAuth, useToast
│   │   ├── layouts/                # AuthLayout, DashboardLayout, ProtectedRoute
│   │   ├── pages/                  # All page-level components
│   │   ├── services/               # Axios API service modules
│   │   └── utils/                  # constants.js, formatters.js
│   ├── index.html
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── BRD.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- A MongoDB Atlas cluster (or local MongoDB 6+)

### 1 — Clone the Repository

```bash
git clone https://github.com/Aneesh2078/Issue-Tracker-System.git
cd "Issue-Tracker-System"
```

### 2 — Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/issue_tracker?retryWrites=true&w=majority
JWT_SECRET=your_very_long_random_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3 — Frontend Setup

```bash
cd ../frontend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4 — Seed Demo Data

With the backend `.env` pointing to a live MongoDB instance, run:

```bash
cd backend
node scripts/seedCompleteData.js
```

This creates all users, 10 realistic issues, 11 comments, and sets the counter.

---

## 🌱 Demo Accounts

> All accounts below are pre-seeded in the MongoDB Atlas database.

| Role | Email | Password | Notes |
|---|---|---|---|
| **Admin** | `admin@exelon.com` | `AdminPass@123` | Full access — manage users, all issues |
| **User** | `vishwambhara@exelon.com` | `User@12345` | Primary demo user — has 5 related issues |
| **User** | `jane.doe@exelon.com` | `UserPass@123` | Assigned EMC shielding issue |
| **User** | `john.smith@exelon.com` | `UserPass@123` | Assigned firmware watchdog issue |
| **User** | `priya.kumar@exelon.com` | `UserPass@123` | **Deactivated** — demonstrates admin toggle |

---

## 🗄️ Seed Data Overview

### Issues (EX-1001 to EX-1010)

| Issue # | Title (abbreviated) | Priority | Status | Created By | Assigned To |
|---|---|---|---|---|---|
| EX-1001 | Thermal runaway on power delivery MOSFETs | Critical | In Progress | Admin | Vishwambhara |
| EX-1002 | Firmware watchdog timer not resetting after UART DMA burst | High | Open | Admin | John Smith |
| EX-1003 | CAD mismatch: capacitor C18 footprint revision | Medium | Open | Admin | — |
| EX-1004 | Missing EMC shielding ground stitch vias | Critical | In Progress | Admin | Jane Doe |
| EX-1005 | Solder bridging on QFN-48 component U12 | High | Closed | Admin | Vishwambhara |
| EX-1006 | I2C bus timeout after soft reboot | High | In Progress | Vishwambhara | Vishwambhara |
| EX-1007 | Excessive SPI clock jitter on ADC test bench | Medium | Open | Vishwambhara | — |
| EX-1008 | GPIO interrupt storm during ESD transient | Critical | Open | Vishwambhara | — |
| EX-1009 | USB enumeration fails on Windows 11 hosts | High | Closed | Vishwambhara | Vishwambhara |
| EX-1010 | Update datasheet links in BOM review wiki | Low | Open | Vishwambhara | — |

### Comments (11 total across 5 issues)
Comments are seeded on issues **EX-1001**, **EX-1004**, **EX-1005**, **EX-1006**, and **EX-1009** with realistic engineering-level discussion.

---

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register new user (always `user` role) |
| `POST` | `/login` | Public | Login, returns JWT |
| `GET` | `/me` | Protected | Get current user profile |

### Issues — `/api/issues`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Protected | List all issues (admin) or own issues (user) |
| `POST` | `/` | Protected | Create a new issue |
| `GET` | `/:id` | Protected | Get single issue by ID |
| `PUT` | `/:id` | Protected | Update issue (admin or owner) |
| `DELETE` | `/:id` | Admin | Delete issue |
| `PATCH` | `/:id/assign` | Admin | Assign issue to a user |
| `PATCH` | `/:id/status` | Protected | Update issue status |

### Comments — `/api/comments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/issue/:issueId` | Protected | Get all comments for an issue |
| `POST` | `/issue/:issueId` | Protected | Add a comment to an issue |
| `DELETE` | `/:id` | Protected | Delete own comment (admin deletes any) |

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Admin | List all users |
| `GET` | `/:id` | Admin | Get user by ID |
| `PATCH` | `/:id/toggle-status` | Admin | Activate / deactivate user |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/stats` | Admin | Aggregated issue statistics |

### Health — `/api/health`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Server health check |

---

## 🗃️ Database Schema

### `users`
```js
{
  name:      String (required),
  email:     String (unique, required),
  password:  String (bcrypt hashed, never returned in API),
  role:      "admin" | "user",
  isActive:  Boolean (default: true),
  createdAt, updatedAt  // Mongoose timestamps
}
```

### `issues`
```js
{
  issueNumber: String (EX-XXXX, unique, auto-generated),
  title:       String (required),
  description: String,
  priority:    "Low" | "Medium" | "High" | "Critical",
  status:      "Open" | "In Progress" | "Closed",
  createdBy:   ObjectId → users,
  assignedTo:  ObjectId → users (nullable),
  createdAt, updatedAt
}
```

### `comments`
```js
{
  issue:  ObjectId → issues,
  user:   ObjectId → users,
  text:   String (required),
  createdAt, updatedAt
}
```

### `counters`
```js
{
  _id: "issueNumber",
  seq: Number   // auto-incremented for each new issue
}
```

---

## 🔒 Security Highlights

- **JWT authentication** — tokens expire in 7 days
- **Role-based middleware** — `protect` and `adminOnly` enforce access on every route
- **Password hashing** — bcrypt with 10 salt rounds
- **Input validation** — `express-validator` on all write endpoints
- **CORS** — configured to allow only the `CLIENT_URL` origin
- **`.env` files** — excluded from Git via `.gitignore`

---

## 🏗️ MongoDB Atlas Setup (for new deployments)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add a database user with read/write privileges
3. Add `0.0.0.0/0` to Network Access (IP Whitelist) for development
4. Copy the connection string and paste it into `backend/.env` as `MONGODB_URI`
5. Run the seed script: `node backend/scripts/seedCompleteData.js`

---

## 📦 Available Scripts

### Backend (`cd backend`)

| Script | Command | Description |
|---|---|---|
| Start (production) | `npm start` | Run server with `node server.js` |
| Dev server | `npm run dev` | Run with `nodemon` (auto-restart) |
| Seed admin only | `node scripts/seedAdmin.js` | Create admin account only |
| Seed all demo data | `node scripts/seedCompleteData.js` | Full seed: users, issues, comments |

### Frontend (`cd frontend`)

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Vite dev server on port 5173 |
| Production build | `npm run build` | Compile to `dist/` |
| Preview build | `npm run preview` | Serve the production build locally |

---

## 🚢 Deployment

### Backend — Railway / Render / Fly.io

1. Connect your GitHub repo
2. Set root directory to `backend`
3. Set environment variables (same as `.env`)
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend — Vercel / Netlify

1. Connect your GitHub repo
2. Set root directory to `frontend`
3. Set environment variable: `VITE_API_URL=https://your-backend-url/api`
4. Build command: `npm run build`
5. Output directory: `dist`

> A `vercel.json` is included in `frontend/` for SPA routing support.

---

## 🧑‍💻 Contributing

This project is a technical assessment submission. Feel free to fork and extend it.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2026 Exelon Circuits Technical Assessment
