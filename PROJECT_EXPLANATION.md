# Ethara AI - Project Explanation Document

## 📋 Quick Summary

**Ethara AI** is a full-stack **Project & Task Management System** built with modern web technologies. It allows users to create projects, manage tasks, collaborate with team members, and provides role-based admin functionality for system-wide management.

**Live Deployment:** https://etharaaiassignment-production-197a.up.railway.app

---

## 🏗️ Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                    │
│         Frontend running on port 5173 (dev) / 80 (prod)     │
└────────────────────────┬────────────────────────────────────┘
                         │
                   HTTP/REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│              SERVER (Express.js + Node.js)                  │
│         Backend running on port 5000 (dev) / 8080 (prod)    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Mongoose ODM
                         │
┌────────────────────────▼────────────────────────────────────┐
│           DATABASE (MongoDB Atlas - Cloud)                  │
│      Database: ethara_taskmanager (Mumbai, AWS)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18.x with JSX
- **Build Tool:** Vite 8.0.13 (lightning-fast bundling)
- **Styling:** Tailwind CSS + PostCSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Type Safety:** TypeScript configuration ready

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js
- **Database ORM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **Input Validation:** express-validator
- **Logging:** Morgan
- **CORS:** Cross-Origin Resource Sharing enabled

### Database
- **Provider:** MongoDB Atlas (Cloud)
- **Type:** Replica Set (3 nodes)
- **Region:** Mumbai, India (AWS ap-south-1)
- **Connection:** Mongoose connection pooling

### Deployment
- **Platform:** Railway
- **Auto-Deploy:** GitHub integration with auto-deploy on push
- **Build System:** Nixpacks
- **Environment:** Production-ready configuration

---

## 📁 Project Structure

```
ethara_ai/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   └── ProtectedRoute.jsx # Auth guard
│   │   ├── pages/               # Page components
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration with admin code
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── Projects.jsx     # Projects listing
│   │   │   └── ProjectDetail.jsx # Project details & tasks
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state management
│   │   ├── utils/
│   │   │   └── api.js           # Axios API client with JWT interceptors
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # React entry point
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
│
├── server/                      # Express Backend
│   ├── src/
│   │   ├── controllers/         # Business logic handlers
│   │   │   ├── authController.js # Auth & user management
│   │   │   ├── projectController.js # Project operations
│   │   │   └── taskController.js # Task operations
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.js          # User schema with roles
│   │   │   ├── Project.js       # Project schema
│   │   │   └── Task.js          # Task schema
│   │   ├── routes/              # API endpoints
│   │   │   ├── authRoutes.js    # /api/auth/*
│   │   │   ├── projectRoutes.js # /api/projects/*
│   │   │   └── taskRoutes.js    # /api/tasks/*
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.js          # JWT verification
│   │   │   ├── errorHandler.js  # Global error handling
│   │   │   └── validate.js      # Request validation
│   │   ├── utils/               # Helper utilities
│   │   │   ├── apiError.js      # Custom error class
│   │   │   └── generateToken.js # JWT generation
│   │   ├── config/
│   │   │   └── db.js            # MongoDB connection
│   │   └── index.js             # Express server entry
│   └── package.json             # Backend dependencies
│
├── package.json                 # Root monorepo config
├── railway.json                 # Railway deployment config
├── README.md                    # User documentation
└── DEPLOYMENT.md                # Deployment guide
```

---

## 🔐 Authentication & Authorization

### User Roles
```
┌──────────────────────────────────────────┐
│          User Roles & Permissions        │
├──────────────────────────────────────────┤
│                                          │
│  ADMIN:                                  │
│  ✓ View all projects                     │
│  ✓ View all tasks                        │
│  ✓ Manage all users                      │
│  ✓ Delete any task                       │
│  ✓ Full system access                    │
│                                          │
│  MEMBER:                                 │
│  ✓ View assigned projects                │
│  ✓ View own tasks                        │
│  ✓ Create projects                       │
│  ✓ Manage own projects                   │
│                                          │
└──────────────────────────────────────────┘
```

### Becoming an Admin
```
Option 1: First User Registration
  → Automatic admin assignment
  → userCount === 0

Option 2: Admin Invite Code
  → Provide ADMIN_INVITE_CODE during registration
  → Currently: "admin123" (configurable via env)
```

### JWT Authentication Flow
```javascript
// 1. User Login/Register
POST /api/auth/login
→ Validate credentials
→ Generate JWT token
→ Return token to client

// 2. Protected API Calls
GET /api/projects
  Headers: { Authorization: "Bearer <jwt_token>" }
→ Middleware verifies token
→ Extract user ID from token
→ Execute request with user context

// 3. Token Expiry
→ JWT_EXPIRES_IN: 7 days (configurable)
→ Token refresh: Re-login required
```

---

## 🚀 API Endpoints

### Authentication
```
POST   /api/auth/register         # User registration
POST   /api/auth/login            # User login
GET    /api/auth/users            # List all users [ADMIN ONLY]
```

### Projects
```
GET    /api/projects              # List user's projects
POST   /api/projects              # Create new project
GET    /api/projects/:id          # Get project details
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
```

### Tasks
```
GET    /api/tasks                 # List user's tasks
GET    /api/tasks/all             # List all tasks [ADMIN ONLY]
POST   /api/tasks                 # Create new task
GET    /api/tasks/:id             # Get task details
PUT    /api/tasks/:id             # Update task
DELETE /api/tasks/:id             # Delete task
```

---

## 🔧 Development Setup

### Prerequisites
- **Node.js:** v20 or higher
- **npm:** v10 or higher
- **Git:** For version control
- **MongoDB:** Local or Atlas connection string

### Installation Steps

**1. Clone & Install Dependencies**
```bash
git clone https://github.com/Prabhatvrma1/ethara_ai_assignment.git
cd ethara_ai

# Install all dependencies (monorepo setup)
npm run install:all
```

**2. Environment Configuration**

Create `.env` in the `server/` directory:
```env
# Server Port
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ethara_taskmanager?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=YourSecureKey123
JWT_EXPIRES_IN=7d

# Admin Code
ADMIN_INVITE_CODE=admin123

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

**3. Start Development Servers**

Terminal 1 - Backend:
```bash
npm run dev:server
# Runs on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
npm run dev:client
# Runs on http://localhost:5173 with HMR
```

**4. Access Application**
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

---

## 🏭 Build & Production

### Building for Production

```bash
# Full build (installs deps + builds both apps)
npm run build

# Output locations:
# - Frontend: client/dist/
# - Backend: Ready to run with 'npm start'
```

### Production Build Output
```
Frontend:
  ✓ Vite minified bundle (~305KB gzipped)
  ✓ Optimized CSS with Tailwind
  ✓ Vendor code splitting
  ✓ index.html with script references

Backend:
  ✓ Node.js server ready
  ✓ Serves React build from /dist
  ✓ API routes configured
  ✓ MongoDB Atlas connection
```

### Start Production Server
```bash
npm start
# Backend listens on PORT env var (default: 5000)
# Serves React frontend from build/dist
```

---

## 🚁 Deployment on Railway

### Deployment Architecture
```
┌─────────────────────────────────────────┐
│         GitHub Repository               │
│    (Prabhatvrma1/ethara_ai_assignment)  │
└────────────────┬────────────────────────┘
                 │
            Git Push
                 │
┌────────────────▼────────────────────────┐
│         Railway Platform                │
│    (triumphant-cooperation)             │
│    ┌───────────────────────────────────┐│
│    │ Build Phase (Node 20)              ││
│    │ Command: npm run build             ││
│    │ Output: Production assets + server ││
│    └───────────────────────────────────┘│
│    ┌───────────────────────────────────┐│
│    │ Deploy Phase                       ││
│    │ Start: npm start                   ││
│    │ Port: 8080                         ││
│    │ Memory: Auto-allocated             ││
│    └───────────────────────────────────┘│
└────────────────┬────────────────────────┘
                 │
            HTTPS
                 │
┌────────────────▼────────────────────────┐
│    https://etharaaiassignment-...       │
│         (Public URL)                    │
└─────────────────────────────────────────┘
```

### Environment Variables on Railway
```
MONGO_URI=mongodb+srv://user:pass@cluster...
JWT_SECRET=YourSecureKey123
JWT_EXPIRES_IN=7d
NODE_ENV=production
ADMIN_INVITE_CODE=admin123
PORT=8080 (auto-assigned)
```

### Railway Configuration (`railway.json`)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "NODE_ENV=production npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Live App
- **URL:** https://etharaaiassignment-production-197a.up.railway.app
- **Status:** ✅ Online
- **Auto-Deploy:** Enabled on git push to main branch

---

## 📊 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  role: String (enum: ['member', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  owner: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  status: String (enum: ['active', 'completed', 'on-hold']),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  project: ObjectId (ref: Project),
  assignee: ObjectId (ref: User),
  status: String (enum: ['todo', 'in-progress', 'completed']),
  priority: String (enum: ['low', 'medium', 'high']),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Common Development Tasks

### Adding a New API Endpoint

**1. Create Controller Method**
```javascript
// server/src/controllers/newController.js
exports.getNewData = async (req, res, next) => {
  try {
    // Business logic
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

**2. Create Route**
```javascript
// server/src/routes/newRoutes.js
const router = require('express').Router();
const { getNewData } = require('../controllers/newController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getNewData);

module.exports = router;
```

**3. Mount Route in index.js**
```javascript
app.use('/api/new', require('./routes/newRoutes'));
```

### Checking Request/Response
```bash
# Use Postman, curl, or Thunder Client
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/projects

# With admin token for admin-only endpoints
curl -H "Authorization: Bearer <admin_token>" \
     http://localhost:5000/api/tasks/all
```

---

## ✅ Testing Workflow

### Manual Testing Steps

**1. User Registration**
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "adminInviteCode": "admin123"  // optional
}
```

**2. Login**
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "john@example.com",
  "password": "Password123"
}
Response: { token: "eyJhbGc..." }
```

**3. Use Token for Protected Routes**
```
GET http://localhost:5000/api/projects
Headers: { Authorization: "Bearer eyJhbGc..." }
```

---

## 🔑 Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **User Authentication** | Secure JWT-based auth | ✅ Complete |
| **Role-Based Access** | Admin vs Member permissions | ✅ Complete |
| **Project Management** | Create, read, update, delete projects | ✅ Complete |
| **Task Management** | Manage project tasks with status tracking | ✅ Complete |
| **Admin Dashboard** | Admin-only endpoints for system management | ✅ Complete |
| **Team Collaboration** | Assign tasks to team members | ✅ Complete |
| **Cloud Deployment** | Production-ready on Railway | ✅ Complete |
| **Real-time Updates** | Frontend hot reload during dev | ✅ Complete |

---

## 📚 Additional Resources

- **Repository:** https://github.com/Prabhatvrma1/ethara_ai_assignment
- **Live App:** https://etharaaiassignment-production-197a.up.railway.app
- **README:** See `README.md` for user documentation
- **Deployment Guide:** See `DEPLOYMENT.md` for deployment details

---

## 🤝 Team Collaboration Guide

### Code Review Checklist
- [ ] Code follows project structure
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] JWT authentication for protected routes
- [ ] Role-based access control checked
- [ ] Tests added for new features

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes, commit
git add .
git commit -m "feat: Add feature description"

# Push and create pull request
git push origin feature/feature-name
```

---

## 📞 Quick Support

**Installation Issues?**
- Ensure Node.js v20+ installed: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf server/node_modules client/node_modules`
- Reinstall: `npm run install:all`

**Database Connection Issues?**
- Check MongoDB URI in `.env`
- Verify IP whitelisting in MongoDB Atlas
- Test connection: `npm run dev:server` (check logs)

**Deployment Issues?**
- Check Railway build logs
- Verify environment variables on Railway
- Check GitHub integration status
- Review deployment guide in `DEPLOYMENT.md`

---

**Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Production Ready ✅
