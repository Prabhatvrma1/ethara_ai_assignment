# Admin & Member Roles - Clarification

## ❌ Problems Fixed

### Issue 1: Admin CANNOT View All Users
**Before:** ANY authenticated user could access `GET /api/auth/users`
**After:** ✅ ONLY admins can access this endpoint

### Issue 2: Members Could Create Projects  
**Before:** ANY authenticated user could create projects
**After:** ✅ ONLY admins can create/update/delete projects

### Issue 3: Unclear Role Hierarchy
**Before:** Confusing permission structure
**After:** ✅ Clear separation of concerns

---

## 🔐 Updated Role Structure

### ADMIN Permissions
```
✅ View all users in system
✅ Create projects
✅ Update projects
✅ Delete projects
✅ View all projects (system-wide)
✅ View all tasks (system-wide)
✅ Delete any task
✅ Manage team members
```

### MEMBER Permissions
```
✅ View own profile
✅ View assigned projects (as member)
✅ Create tasks in assigned projects
✅ Update own tasks
✅ Delete own tasks
❌ Create projects
❌ Update projects
❌ Delete projects
❌ View all users
❌ View all tasks
```

---

## 📊 How It Works Now

### 1. User Registration Flow
```
First User Registration
    ↓
    Automatically becomes ADMIN
    ↓
    Can create projects & manage system
    
Subsequent User Registration
    ↓
    Option A: Register without code → MEMBER
    ↓
    Option B: Register with ADMIN_INVITE_CODE (admin123) → ADMIN
```

### 2. Project Management Flow
```
ADMIN creates project
    ↓
Assigns MEMBER1, MEMBER2, etc. to project
    ↓
MEMBERS see project in their dashboard
    ↓
MEMBERS can create tasks within project
    ↓
ADMIN can see all projects & tasks system-wide
```

### 3. User Management Flow
```
ADMIN calls GET /api/auth/users
    ↓
Gets list of all users in system
    ↓
Can see roles and user details
    
MEMBER calls GET /api/auth/users
    ↓
❌ Gets 403 Forbidden error
    ↓
Cannot see other users
```

---

## 🔑 API Endpoints - Role Protection

### Auth Endpoints
| Endpoint | Method | Admin | Member | Notes |
|----------|--------|-------|--------|-------|
| /api/auth/register | POST | ✅ | ✅ | Any can register |
| /api/auth/login | POST | ✅ | ✅ | Any can login |
| /api/auth/me | GET | ✅ | ✅ | Get own profile |
| /api/auth/users | GET | ✅ | ❌ | View all users (ADMIN ONLY) |

### Project Endpoints
| Endpoint | Method | Admin | Member | Notes |
|----------|--------|-------|--------|-------|
| /api/projects | GET | ✅ All | ✅ Assigned | Admins see all, members see assigned |
| /api/projects | POST | ✅ | ❌ | Only admins create |
| /api/projects/:id | GET | ✅ | ✅ | Only if member/admin |
| /api/projects/:id | PUT | ✅ | ❌ | Only admins edit |
| /api/projects/:id | DELETE | ✅ | ❌ | Only admins delete |

### Task Endpoints
| Endpoint | Method | Admin | Member | Notes |
|----------|--------|-------|--------|-------|
| /api/tasks | GET | ✅ All | ✅ Own | Admins see all, members see own |
| /api/tasks/all | GET | ✅ | ❌ | All tasks in system (ADMIN ONLY) |
| /api/tasks/project/:id | POST | ✅ | ✅ | Create in assigned project |
| /api/tasks/:id | PUT | ✅ | ✅ | Owner/admin can update |
| /api/tasks/:id | DELETE | ✅ | ✅ | Owner/admin can delete |

---

## 🚀 Testing the Changes

### Test 1: Admin Can View All Users
```bash
# Login as admin (first user)
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

# Get list of all users
GET /api/auth/users
Headers: { Authorization: "Bearer <admin_token>" }

✅ Response: 200 OK with all users
```

### Test 2: Member Cannot View All Users
```bash
# Login as member
POST /api/auth/login
{
  "email": "member@example.com",
  "password": "password123"
}

# Try to get all users
GET /api/auth/users
Headers: { Authorization: "Bearer <member_token>" }

❌ Response: 403 Forbidden
{
  "success": false,
  "message": "Only admins can view all users"
}
```

### Test 3: Member Cannot Create Projects
```bash
# Try to create project as member
POST /api/projects
Headers: { Authorization: "Bearer <member_token>" }
{
  "name": "My Project",
  "description": "Test project"
}

❌ Response: 403 Forbidden
{
  "success": false,
  "message": "Only admins can create projects"
}
```

### Test 4: Admin Can Create Projects
```bash
# Create project as admin
POST /api/projects
Headers: { Authorization: "Bearer <admin_token>" }
{
  "name": "Admin Project",
  "description": "Created by admin",
  "members": ["member_id_1", "member_id_2"]
}

✅ Response: 201 Created
```

---

## 🔄 Code Changes Made

### 1. AuthRoutes (`server/src/routes/authRoutes.js`)
```javascript
// Added role check for /api/auth/users
router.get('/users', protect, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can view all users'
    });
  }
  next();
}, getAllUsers);
```

### 2. ProjectController (`server/src/controllers/projectController.js`)
```javascript
// Added role check to createProject
if (req.user.role !== 'admin') {
  throw new ApiError(403, 'Only admins can create projects');
}

// Added role check to updateProject  
if (req.user.role !== 'admin') {
  throw new ApiError(403, 'Only admins can update projects');
}

// Added role check to deleteProject
if (req.user.role !== 'admin') {
  throw new ApiError(403, 'Only admins can delete projects');
}
```

---

## 📝 System Design Philosophy

### Why This Structure?

1. **Projects = Admin Responsibility**
   - Admins control project creation to maintain data integrity
   - Prevents unstructured project proliferation
   - Allows centralized team management

2. **Tasks = Collaborative Work**
   - Project members can create tasks for collaborative workflows
   - Encourages team participation
   - Admins can oversee all tasks

3. **User Management = Admin Only**
   - Prevents member enumeration/privacy issues
   - Admins control who sees what

4. **Scalability**
   - Clear permissions make the system easier to extend
   - Future features (project templates, automation) can build on this foundation

---

## ✅ Next Steps

1. **Test these changes locally:**
   ```bash
   npm run dev:server
   npm run dev:client
   ```

2. **Try admin operations:**
   - Create project as first user (admin)
   - Create another user with admin code
   - Try creating project as regular member (should fail)

3. **Deploy to Railway:**
   ```bash
   git add .
   git commit -m "feat: Add admin-only restrictions for projects and user viewing"
   git push
   ```

4. **Verify on live app:**
   - Test with https://etharaaiassignment-production-197a.up.railway.app

---

## 🐛 Troubleshooting

**Q: I'm an admin but getting 403 error?**
- Check your token: GET /api/auth/me should show "role": "admin"
- Token might be expired, login again

**Q: Member got error "Only admins can create projects"?**
- This is correct! Register with ADMIN_INVITE_CODE=admin123 to become admin

**Q: Project member can't see a project?**
- Project must include them in members array
- Admin needs to add them when creating/updating project

---

**Version:** 1.0  
**Status:** Implemented ✅  
**Date:** May 2026
