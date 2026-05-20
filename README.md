# 📋 Ethara - Team Task Manager

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js->=20-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Latest-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**A modern, full-stack project and task management platform designed for small teams to collaborate seamlessly.**

</div>

## 🎯 Overview

Ethara empowers teams to organize work efficiently with real-time collaboration, intuitive task management, and comprehensive project oversight. Users can sign up, create projects, manage team members, assign tasks, track progress through multiple statuses, and monitor work via an interactive dashboard.

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Live App** | [Add Railway URL here](#) |
| **Repository** | [GitHub - ethara_ai_assignment](https://github.com/Prabhatvrma1/ethara_ai_assignment) |
| **Demo Video** | [Add 2-5 minute walkthrough here](#) |
| **Issues** | [Report a bug](#) |

## ✨ Key Features

### Authentication & Authorization
- 🔐 **JWT-based authentication** with bcryptjs password hashing
- **Admin system**: First registered user automatically becomes admin; additional admins require `ADMIN_INVITE_CODE`
- Role-based access control (Admin and Member permissions)

### Project Management
- ✅ **Full CRUD operations** for projects
- Clear owner/member relationships
- Team member management and assignment
- Project-specific permissions

### Task Management
- 📝 **Rich task attributes**: assignee, status, priority, and due date
- Multiple status workflows
- Priority levels (High, Medium, Low)
- Overdue tracking and notifications

### Dashboard & Reporting
- 📊 **Real-time dashboard** showing task summaries
- Track total, in-progress, completed, and overdue tasks
- Visual insights into team productivity
- Performance metrics

### Data Integrity
- ✔️ **Server-side validation** for all operations
- MongoDB relationships with Mongoose models
- Email and auth validation
- Date validation with overdue detection

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 18, Vite, React Router v6, Axios, React Hot Toast, Tailwind CSS |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ODM |
| **Security** | JWT (JSON Web Tokens), bcryptjs, express-validator |
| **Deployment** | Railway, MongoDB Atlas |

## 📂 Project Structure

```
ethara_ai/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/                 # Context API (Auth management)
│   │   ├── pages/                   # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/                   # API utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/                  # Database configuration
│   │   ├── controllers/             # Business logic
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   └── taskController.js
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   └── Task.js
│   │   ├── routes/                  # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── utils/                   # Utilities
│   │   └── index.js
│   ├── package.json
│   └── Procfile
├── package.json                     # Root scripts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **npm** v10 or higher
- **MongoDB** (local or MongoDB Atlas)
- **Git**

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Prabhatvrma1/ethara_ai_assignment.git
cd ethara_ai_assignment
```

#### 2. Install Dependencies

```bash
npm run install:all
```

This command installs dependencies for both the frontend (`client/`) and backend (`server/`).

#### 3. Environment Configuration

**Backend** - Create `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/ethara_taskmanager

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Admin Code (required for additional admins)
ADMIN_INVITE_CODE=your-secure-admin-code-123
```

**Frontend** - Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

Expected output: `MongoDB connected: localhost` and `Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
npm run dev:client
```

Expected output: `VITE v8.0.13 ready in XXX ms`

#### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:5000/api](http://localhost:5000/api)

## 🌐 Production Deployment (Railway)

### Prerequisites

- [Railway account](https://railway.app)
- [MongoDB Atlas cluster](https://www.mongodb.com/cloud/atlas)
- GitHub repository connected to Railway

### Deployment Steps

1. **Create MongoDB Atlas Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free tier cluster
   - Add IP address 0.0.0.0/0 to IP whitelist
   - Create database user credentials

2. **Create Railway Project**:
   - Connect your GitHub repository
   - Select `ethara_ai_assignment` repository

3. **Configure Environment Variables** in Railway:

```env
# Database
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ethara_taskmanager

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=use-a-very-long-random-secret-key-here
JWT_EXPIRES_IN=7d

# Admin Code
ADMIN_INVITE_CODE=your-private-admin-code

# Frontend (optional, leave empty if same domain)
CLIENT_URL=https://your-railway-domain.up.railway.app
```

4. **Deploy**:
   - Railway automatically deploys from the root `package.json`
   - Express serves the built React app in production
   - Monitor deployment in Railway dashboard

### How It Works in Production

- The root `package.json` build script compiles the React frontend
- Express serves static files from `client/dist/`
- Single service deployment reduces costs and complexity

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email and password |
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/auth/users` | Get all users (Admin only) |

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (Owner only) |

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/dashboard` | Get dashboard summary |
| GET | `/api/tasks/my` | Get user's assigned tasks |
| GET | `/api/tasks/all` | Get all tasks (Admin only) |
| POST | `/api/tasks/project/:projectId` | Create task in project |
| GET | `/api/tasks/project/:projectId` | Get project tasks |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## 💡 Usage Example

### Sign Up & Login

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Project

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"My Project","description":"Project description"}'
```

### Create Task

```bash
curl -X POST http://localhost:5000/api/tasks/project/PROJECT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title":"Complete design",
    "description":"Design new landing page",
    "priority":"high",
    "dueDate":"2025-12-31",
    "assignedTo":"USER_ID"
  }'
```

## 🧪 Demo Workflow

Follow these steps to test the application:

1. **Register First Account**
   - Sign up with any email/password
   - Verify this user becomes admin

2. **Create a Project**
   - Navigate to Projects
   - Create a new project
   - Note your admin status

3. **Add Team Member**
   - Register another account (in incognito)
   - Return to first account
   - Add new user to project as member

4. **Create Tasks**
   - Add tasks to project
   - Set priority (High, Medium, Low)
   - Assign to team members
   - Set due dates

5. **Update Task Status**
   - Move tasks between statuses
   - Watch dashboard update in real-time
   - Check for overdue tasks

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas and update `MONGO_URI` in `.env`

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE :::5000`

**Solution**:
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 PID
```

### React Hot Module Replacement (HMR) Issues

**Problem**: Changes not reflecting in browser

**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Restart development server
- Check if `VITE_API_URL` is correctly set in `client/.env`

### JWT Token Expiration

**Problem**: Getting 401 Unauthorized after some time

**Solution**:
- Re-login to get a fresh token
- Token expires according to `JWT_EXPIRES_IN` setting
- Consider increasing expiry for development

### CORS Issues

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Verify `CLIENT_URL` matches your frontend URL in backend `.env`
- For local development, ensure it's `http://localhost:5173`

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured in `.env` files
- [ ] MongoDB connection tested and working
- [ ] Both dev servers running without errors
- [ ] User registration and login working
- [ ] Project creation and management working
- [ ] Task CRUD operations functional
- [ ] Dashboard displaying correct metrics
- [ ] Admin-only features tested
- [ ] Overdue task detection working
- [ ] Responsive design verified
- [ ] All console errors resolved
- [ ] Railway deployment configured
- [ ] Production variables set correctly
- [ ] MongoDB Atlas connection working

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Created by**: Prabhat  
**GitHub**: [@Prabhatvrma1](https://github.com/Prabhatvrma1)

## 📧 Support

For questions or issues, please:
- [Open an Issue](https://github.com/Prabhatvrma1/ethara_ai_assignment/issues)
- [View Discussions](https://github.com/Prabhatvrma1/ethara_ai_assignment/discussions)

---

**Made with ❤️ for seamless team collaboration**

 
 