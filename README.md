# Ethara - Team Task Manager

Ethara is a full-stack team task manager with authentication, project membership, task assignment, progress tracking, and strict role-based access control.

## Live Links

- Live app: https://etharaaiassignment-production-197a.up.railway.app
- GitHub repo: https://github.com/lmaoded9/ethara_ai_assignment
- Demo video: add your 2-5 minute walkthrough link here

## Roles And Permissions

Admin:

- Can create, update, and delete projects.
- Can add members to projects.
- Can create, edit, assign, and delete tasks.
- Can view all projects and tasks.
- Can view the user list for team assignment.

Member:

- Can view only projects they belong to.
- Can view tasks inside those projects.
- Can update status only for tasks assigned to them.
- Cannot create projects.
- Cannot create, edit, reassign, or delete tasks.
- Cannot view the global user list.

## Features

- Signup/login with JWT authentication.
- Password hashing with bcryptjs.
- First registered user becomes admin; later admin accounts require `ADMIN_INVITE_CODE`.
- MongoDB models for users, projects, and tasks.
- Server-side validation for auth, projects, tasks, members, assignees, and dates.
- Dashboard showing total, in-progress, completed, and overdue tasks.
- Railway-ready single-service deployment.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, React Hot Toast, CSS
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, express-validator
- Deployment: Railway and MongoDB Atlas

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ethara_taskmanager
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_INVITE_CODE=change-this-admin-code
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run development servers:

```bash
npm run dev:server
npm run dev:client
```

Open `http://localhost:5173`.

## Railway Deployment

Deploy from the repository root as one Railway service.

Required Railway variables:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/ethara_taskmanager
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
ADMIN_INVITE_CODE=your-private-admin-code
```

Optional:

```env
CLIENT_URL=https://your-custom-domain.com
```

If the frontend and API are served by the same Railway service, `CLIENT_URL` can stay unset.

## API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/users` admin only

Projects:

- `GET /api/projects`
- `POST /api/projects` admin only
- `GET /api/projects/:id`
- `PUT /api/projects/:id` admin only
- `DELETE /api/projects/:id` admin only

Tasks:

- `GET /api/tasks/dashboard`
- `GET /api/tasks/my`
- `GET /api/tasks/all` admin only
- `POST /api/tasks/project/:projectId` admin only
- `GET /api/tasks/project/:projectId`
- `PUT /api/tasks/:id` admin full edit, assigned members status-only
- `DELETE /api/tasks/:id` admin only

## Demo Flow

1. Register the first account and show it becomes admin.
2. Create a project.
3. Register a member account.
4. Add the member to the project.
5. Create and assign tasks as admin.
6. Log in as member and show they can only update progress on assigned tasks.
7. Log back in as admin and show full task/project controls.
