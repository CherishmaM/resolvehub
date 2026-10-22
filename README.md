# ResolveHub - Full-Stack Smart Issue & Request Tracker

ResolveHub is a production-grade, full-stack issue and request tracking platform designed with clean architecture, enterprise security, intuitive UI/UX, and end-to-end integration across MongoDB, Express, React, and Node.js.

Team members can report software bugs, UI problems, backend failures, database bottlenecks, and feature requests. Leads and administrators can assign tickets, update progress through a structured workflow, leave discussion comments, and audit complete activity timelines.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Enforces clear administrative (`admin`) vs team (`member`) privileges on both backend API and client UI.
- **Secure Authentication**: Password hashing with `bcryptjs`, JWT stored in `HttpOnly`, `SameSite: 'lax'` cookies with Bearer header fallback, rate limiting, and CORS exact-origin validation.
- **Interactive Issue Workflow**: Lifecycle transitions (`Open` ➔ `In Progress` ➔ `Resolved`) with automatic `resolvedAt` timestamp synchronization.
- **Real-Time Dashboard Analytics**: Real MongoDB aggregation metrics with dynamic **Recharts** visualizations (Donut Chart for status distribution, Bar Chart for priority volume).
- **Audit Activity Trail**: Automatic audit logging for every lifecycle event (`Created`, `Assigned`, `Status Changed`, `Priority Changed`, `Updated`, `Comment Added`).
- **Discussion Threads**: Threaded issue comments with author badges and relative timestamps.
- **Search, Filters & Pagination**: Multi-parameter search and filtering by status, priority, category, and assignee with server-side pagination.
- **SaaS UI/UX Design**: Clean, light background, white cards, deep navy sidebar, purple primary accents, and responsive mobile navigation drawer.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts |
| **Backend** | Node.js (v22+), Express.js, Mongoose, Zod request validation, Helmet, Cookie-Parser, Express-Rate-Limit |
| **Database** | MongoDB 8.0+ (Local MongoDB or MongoDB Atlas) |
| **Testing** | Jest, Supertest, MongoMemoryServer |

---

## 📁 Project Architecture & Folder Structure

```
fixflow/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (Mongoose connection), env.js (Env validation)
│   │   ├── models/          # User.js, Issue.js, Comment.js, Activity.js
│   │   ├── routes/          # auth, issues, comments, activity, dashboard, users
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── services/        # Business logic & DB queries
│   │   ├── middleware/      # authenticate, authorize, validate, errorHandler, rateLimiter
│   │   ├── validators/      # Zod validation schemas
│   │   ├── utils/           # apiError, apiResponse, jwt
│   │   ├── app.js           # Express app configuration & middlewares
│   │   └── server.js        # Server listener & graceful shutdown
│   ├── scripts/
│   │   └── seed.js          # Development-only database seeding
│   ├── tests/               # Automated test suites with Jest & Supertest
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance & feature API modules
│   │   ├── components/
│   │   │   ├── layout/      # Sidebar, Topbar, AppLayout, ProtectedRoute
│   │   │   ├── ui/          # StatCard, StatusBadge, PriorityBadge, ConfirmDialog, Pagination, etc.
│   │   │   ├── issues/      # IssueTable, IssueFilters, IssueForm, ActivityTimeline
│   │   │   ├── dashboard/   # StatusDonutChart, PriorityBarChart
│   │   │   └── comments/    # CommentList, CommentForm
│   │   ├── context/         # AuthContext.jsx
│   │   ├── pages/           # Dashboard, Issues, IssueDetails, CreateIssue, Team, Settings, Login, Register
│   │   ├── utils/           # formatters.js
│   │   ├── App.jsx          # Route definitions & router setup
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🗄️ Database Schema & Data Models

### 1. User
- `name` (String, required, min 2, max 50)
- `email` (String, required, unique, lowercase)
- `passwordHash` (String, required, select: false)
- `role` (String, enum: `['admin', 'member']`, default: `'member'`)
- `avatar` (String)
- `isActive` (Boolean, default: `true`)
- Timestamps (`createdAt`, `updatedAt`)

### 2. Issue
- `title` (String, required, min 3, max 120)
- `description` (String, required, max 2000)
- `category` (Enum: `['Frontend', 'Backend', 'Database', 'UI/UX', 'Feature Request', 'Other']`)
- `priority` (Enum: `['Low', 'Medium', 'High', 'Critical']`, default: `'Medium'`)
- `status` (Enum: `['Open', 'In Progress', 'Resolved']`, default: `'Open'`)
- `createdBy` (ObjectId ref `User`, required)
- `assignedTo` (ObjectId ref `User`, nullable)
- `resolvedAt` (Date, nullable - auto-set when Resolved, cleared if reopened)
- Indexes: `{ status: 1, priority: 1 }`, `{ assignedTo: 1 }`, `{ createdBy: 1 }`, Text search index

### 3. Comment
- `issueId` (ObjectId ref `Issue`, required)
- `userId` (ObjectId ref `User`, required)
- `text` (String, required, min 1, max 1000)
- Timestamps (`createdAt`, `updatedAt`)

### 4. Activity
- `issueId` (ObjectId ref `Issue`, required)
- `actorId` (ObjectId ref `User`, required)
- `action` (Enum: `['Created', 'Assigned', 'Status Changed', 'Priority Changed', 'Updated', 'Comment Added']`)
- `details` (Mixed object: stores `{ fromStatus, toStatus }`, `{ toAssignee }`, etc.)
- `createdAt` (Date, default: `Date.now`)

---

## 📡 REST API Reference (`/api/v1`)

### Authentication
- `POST /api/v1/auth/register`: Register a new team member (always `member` role).
- `POST /api/v1/auth/login`: Authenticate credentials, issues HttpOnly cookie and JWT token.
- `POST /api/v1/auth/logout`: Clears authentication cookie.
- `GET /api/v1/auth/me`: Retrieves current authenticated user profile.

### Issues
- `GET /api/v1/issues`: List issues with search (`?search=`), filtering (`?status=`, `?priority=`, `?category=`), sorting (`?sortBy=`, `?sortOrder=`), and pagination (`?page=1&limit=10`).
- `POST /api/v1/issues`: Create an issue.
- `GET /api/v1/issues/:id`: Get full details of an issue.
- `PATCH /api/v1/issues/:id`: Update title, description, category, priority (Admin or Issue Creator).
- `PATCH /api/v1/issues/:id/status`: Update status (Admin, Creator, or Assignee).
- `PATCH /api/v1/issues/:id/assign`: Assign/reassign issue to active member (Admin only).
- `DELETE /api/v1/issues/:id`: Permanently delete issue and cascade clean comments & activities (Admin only).

### Comments & Activity
- `GET /api/v1/issues/:id/comments`: Fetch all discussion comments.
- `POST /api/v1/issues/:id/comments`: Post a new comment.
- `GET /api/v1/issues/:id/activities`: Fetch audit timeline history.

### Dashboard & Team
- `GET /api/v1/dashboard/stats`: Returns aggregated totals, status breakdown, priority volume, and recent tickets.
- `GET /api/v1/users`: List all active team members.
- `PATCH /api/v1/users/:id/role`: Change user role between `admin` and `member` (Admin only; self-demotion protected).

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js v18+ or v22+
- Local MongoDB (running on `mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/fixflow.git
cd fixflow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/fixflow
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Seed Demo Data (Optional for Development)

Populate 4 users (1 Admin, 3 Members), 12 realistic issues across categories/priorities, discussion comments, and activities:

```bash
cd backend
npm run seed
```

**Demo Credentials:**
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@fixflow.dev` | `Admin123!` |
| **Member (Dev)** | `sarah@fixflow.dev` | `Member123!` |
| **Member (UI/UX)** | `marcus@fixflow.dev` | `Member123!` |
| **Member (Backend)** | `elena@fixflow.dev` | `Member123!` |

*(Note: The login page includes 1-click demo credential autofill buttons for immediate testing).*

### 4. Start Development Servers

**Backend API:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend Application:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🧪 Automated Testing

FixFlow backend includes a complete automated test suite powered by **Jest**, **Supertest**, and **MongoMemoryServer** (in-memory MongoDB test isolation without touching persistent data):

```bash
cd backend
npm test
```

**Test Coverage Highlights:**
- ✅ Member self-registration & client role-escalation denial
- ✅ Duplicate email rejection (409 Conflict)
- ✅ Password hashing verification via bcrypt
- ✅ Login success & invalid password rejection
- ✅ Session cookie issuance & `/auth/me` validation
- ✅ Issue creation, input validation, and pagination
- ✅ Status lifecycle transition (`Open` ➔ `In Progress` ➔ `Resolved`) with `resolvedAt` timestamp check
- ✅ Role-based assignment protection & forbidden member deletion
- ✅ Real MongoDB aggregation dashboard counts verification

---

## 🚀 Deployment Guide

### Backend Deployment (Render / Railway / Heroku)
1. Set the Root Directory to `backend`.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fixflow`
   - `JWT_SECRET=<secure_random_string>`
   - `FRONTEND_URL=https://your-fixflow-app.vercel.app`

### Frontend Deployment (Vercel)
1. Import the repository in Vercel.
2. Set the Root Directory to `frontend`.
3. Framework Preset: `Vite`.
4. Environment Variables:
   - `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api/v1`
5. Deploy!

---

## 🔒 Security & Best Practices

- **Never Trust Client Input**: Role fields passed during user registration are stripped. All roles default to `member`.
- **Self-Demotion Lockout Guard**: Administrators cannot change their own role, preventing accidental organization lockout.
- **Safe Sanitization**: MongoDB queries are sanitized against NoSQL injection using type-safe validation with Zod.
- **Security Headers**: Powered by `helmet` to mitigate clickjacking, MIME sniffing, and cross-site scripting.
- **Production Error Masking**: Centralized error middleware masks stack traces and internal exceptions in production.

---

## 📄 License
MIT License. Built for high reliability and portfolio presentation.
