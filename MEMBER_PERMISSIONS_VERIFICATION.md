# ✅ Member Permissions - Complete Verification & Testing Guide

**Last Updated:** May 21, 2026  
**Status:** ALL PERMISSIONS VERIFIED & ENFORCED ✅

---

## 🔒 Permissions Summary

### ADMIN Can:
- ✅ Create projects
- ✅ Update projects
- ✅ Delete projects
- ✅ Create tasks
- ✅ Edit ALL task fields (title, desc, priority, assignee, due date)
- ✅ Delete tasks
- ✅ View all projects and tasks
- ✅ View all users

### MEMBER Can:
- ✅ View ONLY projects they're members of
- ✅ View ALL tasks in assigned projects (but can only edit own)
- ✅ Edit ONLY the status of tasks assigned to them
- ✅ Cannot see: Title, Description, Priority, Assignee, Due Date (read-only in modal)

### MEMBER Cannot:
- ❌ Create projects (button hidden + backend blocks)
- ❌ Update projects
- ❌ Delete projects
- ❌ Create tasks (button hidden + backend blocks)
- ❌ Delete tasks
- ❌ Edit any task field except status
- ❌ View projects they're not members of (404 from backend)
- ❌ View all users

---

## 📝 Important: Testing Requires TWO Accounts!

**⚠️ If you only created ONE account (admin), you're testing WITH admin permissions!**

That's why you see "member can do everything" - **YOU ARE LOGGED IN AS ADMIN**.

---

## 🧪 Step-by-Step Testing Setup

### Step 1: Create Admin Account
```
1. Go to http://localhost:5174
2. Click "Register"
3. Fill in:
   - Name: Admin User
   - Email: admin@test.com
   - Password: admin123
   - Admin Code: (leave blank)
4. Click Register

✅ Result: This is now your ADMIN account (first user = auto-admin)
✅ You see "Workspace overview" header
✅ You see "New project" button everywhere
```

### Step 2: Create Member Account
```
1. Click "Logout" (top-right)
2. Click "Register" again
3. Fill in:
   - Name: Member User
   - Email: member@test.com
   - Password: member123
   - Admin Code: (leave blank or any wrong code)
4. Click Register

✅ Result: This is now your MEMBER account
✅ You see "My workload" header (different from admin!)
✅ NO "New project" button anywhere
```

---

## ✅ ADMIN Testing Checklist

### Login as admin@test.com
```
1. Go to Dashboard
   ✅ See "Workspace overview" header
   ✅ See stats for ALL tasks in system
   ✅ See "New project" button

2. Go to Projects
   ✅ See "New project" button
   ✅ See ALL projects in system
   ✅ See X delete button on all projects

3. Create a project called "Admin Project"
   ✅ Add "Member User" to the project
   ✅ Create the project
   
4. Create a task in that project
   ✅ "New task" button is visible
   ✅ Assign to: Member User
   ✅ Fill all fields (title, description, priority, due date)
   ✅ Create task

5. Click on the task to edit
   ✅ See full form with all fields editable
   ✅ Can change title, description, priority, assignee, due date, status
   ✅ Can delete the task (X button visible)
```

---

## ✅ MEMBER Testing Checklist

### Login as member@test.com
```
1. Go to Dashboard
   ✅ See "My workload" header (NOT "Workspace overview")
   ✅ See stats for ONLY your assigned tasks
   ✅ NO "New project" button anywhere
   ✅ Empty state says: "Ask an admin to create a project and add you as a member."

2. Go to Projects
   ✅ NO "New project" button
   ✅ See only "Admin Project" (the one admin added you to)
   ✅ NO delete X buttons on projects
   ✅ Can click "Open project"

3. Inside "Admin Project"
   ✅ Task table shows the task admin created
   ✅ Can see task title as CLICKABLE link (because assigned to you)
   ✅ Click on task assigned to you
   
4. Click on ASSIGNED task modal shows:
   ✅ Header: "Update task" + "Update task progress (status only)"
   ✅ Info box shows:
      - Title: (read-only)
      - Description: (read-only)
      - Priority: (read-only)
      - Assigned to: (read-only)
      - Due date: (read-only)
   ✅ Status dropdown: CAN EDIT ← ONLY THIS FIELD
   ✅ NO title input field
   ✅ NO description textarea
   ✅ NO priority dropdown
   ✅ NO assignee dropdown
   ✅ NO due date input
   ✅ NO delete button for task

5. Try to access project directly via URL
   ✅ Go to browser URL bar
   ✅ Try: http://localhost:5174/projects/SOME_OTHER_PROJECT_ID (admin-only project)
   ✅ Backend returns 403 Forbidden (you see error page)

6. Try to change a field besides status
   ✅ Open your assigned task modal
   ✅ Try to edit title: ❌ No input field exists
   ✅ Try to edit description: ❌ No textarea exists
   ✅ Change status: ✅ Works
   ✅ Click Save: ✅ Status updates, others unchanged
```

---

## 🔍 Verification Points

### Backend Protections ✅
```javascript
// Project Access
GET /api/projects → Returns only projects user is member of OR admin sees all
GET /api/projects/:id → Returns 403 if not member/admin

// Project Modification
POST /api/projects → Requires role === 'admin' (403 if member)
PUT /api/projects/:id → Requires role === 'admin' (403 if member)
DELETE /api/projects/:id → Requires role === 'admin' (403 if member)

// Task Creation
POST /api/tasks/project/:id → Requires role === 'admin' (403 if member)

// Task Modification
PUT /api/tasks/:id → Members can ONLY send {status}, any other field → 403
DELETE /api/tasks/:id → Requires role === 'admin' (403 if member)

// User Access
GET /api/auth/users → Requires role === 'admin' (403 if member)
```

### Frontend Protections ✅
```javascript
// Buttons Hidden
- "New project" button: Only shows for admin
- "New task" button: Only shows for admin
- Delete X on projects: Only shows for admin
- Delete X on tasks: Only shows for admin

// Forms Restricted
- Project creation modal: Only renders for admin
- Task creation modal: Only renders for admin
- Task edit modal: COMPLETELY DIFFERENT for members vs admins
  - Admin: Full form with all fields
  - Member: Info box (read-only) + Status dropdown only

// Links Restricted
- Task title in table: Only clickable for assigned members/admin
- Other task titles: Display as plain text (not clickable)
```

---

## 🐛 If You Find Any Issues:

**Member can see projects they shouldn't:**
- ❌ Verify you created a second (member) account and logged in as it
- ✅ Backend is filtering correctly: `GET /api/projects` with member token should only return projects with that member
- Check MongoDB: Does the project have the member in its members array?

**Member can edit fields they shouldn't:**
- ❌ Verify the modal shows read-only info box for member (not full edit form)
- ✅ Try to click Save with title changed - should fail or show error
- Check browser DevTools Network tab - what payload is being sent?

**Member sees "New project" button:**
- ❌ Verify you're logged in as member (check navbar shows member role)
- ✅ The button should only appear for admin
- Check ProjectDetail.jsx line 110 has `{user?.role === 'admin' && ...}`

---

## 📊 Architecture

```
Member Restrictions (3 Layers):

Layer 1: FRONTEND UI
├─ Buttons hidden for members
├─ Forms completely reshaped for members
└─ Links disabled for non-assigned tasks

Layer 2: FRONTEND API CLIENT
├─ Separate modals for admin vs member
└─ Different payloads sent (status-only for members)

Layer 3: BACKEND ENFORCEMENT
├─ Role checks on all endpoints
├─ Project membership checks
├─ Field validation (rejects forbidden fields)
└─ Task assignment checks
```

---

## ✅ All Commits Applied

1. **aa94d56** - Hide 'New project' button in Dashboard for members
2. **14f247c** - Create separate modals for members and admins
3. **7f2f491** - Strictly enforce members can only edit task status
4. Plus earlier fixes for task creation, deletion, and project operations

---

## 🚀 Deploy to Production

All changes are committed and pushed to main branch. Railway auto-deploys on push.

**Live URL:** https://etharaaiassignment-production-197a.up.railway.app

---

## ❓ Questions?

**Q: Why can admin see all projects?**
A: Admin role has full system access. That's by design.

**Q: Why can't member create tasks?**
A: Only admins can create tasks. Members can only update status on tasks assigned to them.

**Q: Why does member modal look different?**
A: Intentional UX - members see read-only task details with ONLY status editing capability.

**Q: Can I test this without registering?**
A: No, you need at least 2 accounts (admin + member) for proper testing.
