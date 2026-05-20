# Railway Deployment Guide

This project is set up for a single Railway service from the repository root. Railway runs `npm run build`, then `npm start`.

## 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Allow Railway/network access in Atlas.
4. Copy the connection string.

Example:

```text
mongodb+srv://USER:PASSWORD@cluster.mongodb.net/ethara_taskmanager
```

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Build team task manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ethara_ai.git
git push -u origin main
```

## 3. Create Railway Service

1. Open Railway.
2. New Project -> Deploy from GitHub.
3. Select this repository.
4. Keep the service root as the repo root.

The included `railway.json` configures:

- Build command: `npm run build`
- Start command: `npm start`

## 4. Add Environment Variables

Required:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/ethara_taskmanager
JWT_SECRET=generate-a-long-random-string
JWT_EXPIRES_IN=7d
NODE_ENV=production
ADMIN_INVITE_CODE=choose-a-private-admin-code
```

Optional:

```env
CLIENT_URL=https://your-custom-domain.com
```

For the default single Railway URL, leave `CLIENT_URL` unset. The frontend calls `/api`, so no client-side production API variable is needed.

## 5. Verify Production

Open the Railway public URL and test:

1. Health check: `https://YOUR-APP.up.railway.app/api/health`
2. Register first user. This user should be admin.
3. Create a project.
4. Register a member account.
5. Add the member to a project.
6. Create, assign, update, and delete tasks.
7. Confirm dashboard counts update.

## 6. Submission Assets

Add these to `README.md` before submitting:

- Live URL
- GitHub repo URL
- 2-5 minute demo video URL

Suggested demo order:

1. Signup/login
2. Project creation and member selection
3. Task creation with assignee, priority, and due date
4. Status updates and overdue/dashboard behavior
5. Admin/owner controls
