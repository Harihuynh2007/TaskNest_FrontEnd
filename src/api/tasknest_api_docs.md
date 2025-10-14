# TaskNest API Documentation

## 📋 Overview

TaskNest API is a RESTful service built with Django REST Framework that powers a Trello-like task management application. The API follows REST conventions and provides comprehensive endpoints for managing workspaces, boards, lists, cards, and user collaboration.

**Base URL:** `https://api.tasknest.com/api/v1/`  
**Authentication:** JWT (JSON Web Tokens)  
**Response Format:** JSON

---

## 🏗️ Architecture

### Tech Stack
- **Backend Framework:** Django REST Framework
- **Authentication:** JWT with access & refresh tokens
- **Database:** PostgreSQL (production), SQLite (development)
- **Real-time:** Django Channels + Redis (WebSocket support)

### Core Modules
```
/api/v1/
├── auth/              # Authentication & user management
├── workspaces/        # Workspace CRUD & management
├── boards/            # Board operations & sharing
├── lists/             # List management within boards
├── cards/             # Card CRUD, assignments, checklists
└── notifications/     # User notifications & activity feed
```

---

## 🔐 Authentication

### JWT Token Flow

TaskNest uses JWT-based authentication with access and refresh token pairs:

- **Access Token:** Short-lived (1 hour), used for API requests
- **Refresh Token:** Long-lived (7 days), used to obtain new access tokens

#### Login
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response 200:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Get Current User
```http
GET /api/v1/auth/me/
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/v1/auth/logout/
Authorization: Bearer <access_token>

{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Google OAuth Integration
```http
POST /api/v1/auth/google/
Content-Type: application/json

{
  "token": "google_oauth_token"
}
```

---

## 👤 User Profile

### Get User Profile
```http
GET /api/v1/auth/me/profile/
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar": "https://cdn.tasknest.com/avatars/user1.jpg",
  "bio": "Product Manager",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Update Profile
```http
PATCH /api/v1/auth/me/profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "John Smith",
  "bio": "Senior Product Manager"
}
```

---

## 🏢 Workspaces

Workspaces are the top-level organizational unit in TaskNest. Each user can create multiple workspaces and invite team members.

### List Workspaces
```http
GET /api/v1/workspaces/
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Personal Projects",
      "description": "My personal task management",
      "created_at": "2025-01-15T10:30:00Z",
      "role": "owner",
      "members_count": 1,
      "boards_count": 5
    }
  ]
}
```

### Create Workspace
```http
POST /api/v1/workspaces/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Marketing Team",
  "description": "Marketing campaigns and content planning"
}
```

**Response 201:**
```json
{
  "id": 2,
  "name": "Marketing Team",
  "description": "Marketing campaigns and content planning",
  "created_at": "2025-10-14T10:30:00Z",
  "role": "owner"
}
```

### Get Workspace Details
```http
GET /api/v1/workspaces/{workspace_id}/
Authorization: Bearer <access_token>
```

### Update Workspace
```http
PATCH /api/v1/workspaces/{workspace_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Workspace Name"
}
```

### Delete Workspace
```http
DELETE /api/v1/workspaces/{workspace_id}/
Authorization: Bearer <access_token>
```

**Response 204:** No Content (Soft delete - workspace marked as deleted)

---

## 📋 Boards

Boards contain lists and cards. Each board belongs to a workspace and has role-based access control.

### List Boards in Workspace
```http
GET /api/v1/workspaces/{workspace_id}/boards/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by board name
- `archived` (optional): Filter archived boards (true/false)

**Response 200:**
```json
{
  "count": 12,
  "next": "/api/v1/workspaces/1/boards/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Product Roadmap Q4",
      "description": "Q4 2025 product development roadmap",
      "workspace_id": 1,
      "created_at": "2025-09-01T10:00:00Z",
      "updated_at": "2025-10-14T15:30:00Z",
      "background_color": "#0079BF",
      "is_archived": false,
      "role": "admin",
      "lists_count": 4,
      "members_count": 5
    }
  ]
}
```

### Create Board
```http
POST /api/v1/boards/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Design and development of new company website",
  "workspace_id": 1,
  "background_color": "#00C875"
}
```

### Get Board Details
```http
GET /api/v1/boards/{board_id}/
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "id": 1,
  "name": "Product Roadmap Q4",
  "description": "Q4 2025 product development roadmap",
  "workspace_id": 1,
  "created_at": "2025-09-01T10:00:00Z",
  "background_color": "#0079BF",
  "members": [
    {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  ],
  "lists": [
    {
      "id": 1,
      "name": "Backlog",
      "position": 0,
      "cards_count": 12
    }
  ]
}
```

### Update Board
```http
PATCH /api/v1/boards/{board_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Product Roadmap Q1 2026",
  "background_color": "#FF6B6B"
}
```

### Archive Board
```http
POST /api/v1/boards/{board_id}/archive/
Authorization: Bearer <access_token>
```

### Restore Board
```http
POST /api/v1/boards/{board_id}/restore/
Authorization: Bearer <access_token>
```

### Delete Board
```http
DELETE /api/v1/boards/{board_id}/
Authorization: Bearer <access_token>
```

---

## 🔗 Board Sharing & Invitations

### Generate Share Link
```http
POST /api/v1/boards/{board_id}/share-link/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "member",
  "expires_in_days": 7
}
```

**Response 201:**
```json
{
  "share_link": "https://tasknest.com/invite/abc123xyz",
  "token": "abc123xyz",
  "expires_at": "2025-10-21T10:30:00Z"
}
```

### Invite via Email
```http
POST /api/v1/boards/{board_id}/invite/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "colleague@example.com",
  "role": "member"
}
```

### List Board Members
```http
GET /api/v1/boards/{board_id}/members/
Authorization: Bearer <access_token>
```

### Update Member Role
```http
PATCH /api/v1/boards/{board_id}/members/{user_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "admin"
}
```

**Available Roles:**
- `owner` - Full control, can delete board
- `admin` - Can manage members and settings
- `member` - Can create/edit cards and lists
- `guest` - View-only access

---

## 📝 Lists

Lists organize cards within a board (e.g., "To Do", "In Progress", "Done").

### Create List
```http
POST /api/v1/boards/{board_id}/lists/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "In Review",
  "position": 2
}
```

### Update List
```http
PATCH /api/v1/lists/{list_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Quality Assurance"
}
```

### Move List
```http
POST /api/v1/lists/{list_id}/move/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "position": 1
}
```

### Archive List
```http
POST /api/v1/lists/{list_id}/archive/
Authorization: Bearer <access_token>
```

### Delete List
```http
DELETE /api/v1/lists/{list_id}/
Authorization: Bearer <access_token>
```

---

## 🎴 Cards

Cards are individual tasks or items within lists.

### List Cards in Board
```http
GET /api/v1/boards/{board_id}/cards/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `list_id` (optional): Filter by list
- `assigned_to` (optional): Filter by assigned user ID
- `labels` (optional): Filter by label IDs (comma-separated)
- `due_date_start` (optional): Filter cards due after date
- `due_date_end` (optional): Filter cards due before date

### Create Card
```http
POST /api/v1/lists/{list_id}/cards/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with refresh tokens",
  "position": 0,
  "due_date": "2025-10-20T23:59:59Z",
  "assigned_to": [1, 2],
  "labels": [1, 3]
}
```

**Response 201:**
```json
{
  "id": 42,
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with refresh tokens",
  "list_id": 1,
  "position": 0,
  "due_date": "2025-10-20T23:59:59Z",
  "created_at": "2025-10-14T10:30:00Z",
  "assigned_to": [
    {
      "id": 1,
      "full_name": "John Doe",
      "avatar": "https://cdn.tasknest.com/avatars/user1.jpg"
    }
  ],
  "labels": [
    {
      "id": 1,
      "name": "Backend",
      "color": "#FF6B6B"
    }
  ],
  "checklist_progress": {
    "completed": 0,
    "total": 0
  }
}
```

### Get Card Details
```http
GET /api/v1/cards/{card_id}/
Authorization: Bearer <access_token>
```

### Update Card
```http
PATCH /api/v1/cards/{card_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Complete user authentication",
  "description": "Updated description"
}
```

### Move Card
```http
POST /api/v1/cards/{card_id}/move/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "list_id": 2,
  "position": 1
}
```

### Delete Card
```http
DELETE /api/v1/cards/{card_id}/
Authorization: Bearer <access_token>
```

---

## ✅ Checklists

Each card can have multiple checklists with items.

### Add Checklist
```http
POST /api/v1/cards/{card_id}/checklists/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Development Tasks"
}
```

### Add Checklist Item
```http
POST /api/v1/checklists/{checklist_id}/items/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "text": "Write unit tests",
  "position": 0
}
```

### Toggle Item Completion
```http
PATCH /api/v1/checklist-items/{item_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "is_completed": true
}
```

---

## 💬 Comments

### List Card Comments
```http
GET /api/v1/cards/{card_id}/comments/
Authorization: Bearer <access_token>
```

### Add Comment
```http
POST /api/v1/cards/{card_id}/comments/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "text": "I've started working on this task"
}
```

### Update Comment
```http
PATCH /api/v1/comments/{comment_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "text": "Updated comment text"
}
```

### Delete Comment
```http
DELETE /api/v1/comments/{comment_id}/
Authorization: Bearer <access_token>
```

---

## 🔔 Notifications

### List User Notifications
```http
GET /api/v1/notifications/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `unread` (optional): Filter unread notifications (true/false)
- `type` (optional): Filter by type (comment, assignment, mention, due_date)

**Response 200:**
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "type": "assignment",
      "message": "You were assigned to 'Implement user authentication'",
      "card_id": 42,
      "is_read": false,
      "created_at": "2025-10-14T09:30:00Z"
    }
  ]
}
```

### Mark as Read
```http
POST /api/v1/notifications/{notification_id}/read/
Authorization: Bearer <access_token>
```

### Mark All as Read
```http
POST /api/v1/notifications/read-all/
Authorization: Bearer <access_token>
```

---

## 🔄 Real-time Updates (WebSocket)

TaskNest supports real-time collaboration via WebSocket connections.

### Connection
```javascript
const ws = new WebSocket('wss://api.tasknest.com/ws/board/{board_id}/?token=<access_token>');
```

### Event Types

**Card Updated:**
```json
{
  "type": "card.updated",
  "data": {
    "card_id": 42,
    "list_id": 2,
    "title": "Updated title",
    "updated_by": {
      "id": 1,
      "full_name": "John Doe"
    }
  }
}
```

**Card Moved:**
```json
{
  "type": "card.moved",
  "data": {
    "card_id": 42,
    "from_list_id": 1,
    "to_list_id": 2,
    "position": 0
  }
}
```

**Member Joined:**
```json
{
  "type": "member.joined",
  "data": {
    "user_id": 3,
    "full_name": "Jane Smith",
    "role": "member"
  }
}
```

**Comment Added:**
```json
{
  "type": "comment.added",
  "data": {
    "comment_id": 15,
    "card_id": 42,
    "author": {
      "id": 1,
      "full_name": "John Doe"
    },
    "text": "Great work!"
  }
}
```

---

## 📊 Error Handling

All API errors follow a consistent format:

### Error Response Structure
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": {
      "field_name": ["Specific error detail"]
    }
  }
}
```

### Common Error Codes

| HTTP Code | Error Code | Description |
|-----------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 401 | `INVALID_TOKEN` | Authentication token is invalid or expired |
| 401 | `TOKEN_EXPIRED` | Access token has expired, refresh needed |
| 403 | `PERMISSION_DENIED` | Insufficient permissions for this action |
| 404 | `WORKSPACE_NOT_FOUND` | Workspace does not exist |
| 404 | `BOARD_NOT_FOUND` | Board does not exist |
| 404 | `CARD_NOT_FOUND` | Card does not exist |
| 409 | `EMAIL_ALREADY_EXISTS` | Email is already registered |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |

### Validation Error Example
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "name": ["This field is required"],
      "email": ["Enter a valid email address"]
    }
  }
}
```

### Permission Error Example
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to delete this board",
    "details": {
      "required_role": "admin",
      "current_role": "member"
    }
  }
}
```

---

## 🚀 Future Features (Roadmap)

### Phase 1 (Q4 2025)
- **Advanced Search**: Full-text search across cards, comments, and attachments
- **File Attachments**: Upload and attach files to cards (images, documents, PDFs)
- **Custom Fields**: Add custom fields to cards (dates, numbers, dropdowns)
- **Board Templates**: Pre-built templates for common workflows (Kanban, Scrum, Marketing)

### Phase 2 (Q1 2026)
- **Automation Rules**: Trigger actions based on card events (e.g., auto-assign, auto-label)
- **Calendar View**: Visualize cards with due dates in calendar format
- **Timeline View**: Gantt-chart style view for project planning
- **Card Dependencies**: Link cards with dependency relationships

### Phase 3 (Q2 2026)
- **Power-Ups/Integrations**:
  - Slack notifications
  - Google Drive integration
  - GitHub issue sync
  - Zapier webhooks
- **Advanced Analytics**: Board activity metrics, productivity insights
- **Mobile API**: Optimized endpoints for mobile apps
- **Offline Support**: Sync queue for offline operations

### Phase 4 (Q3 2026)
- **AI Features**:
  - Smart card suggestions
  - Auto-categorization
  - Due date predictions
  - Summary generation
- **Multi-board Views**: Dashboard combining multiple boards
- **Custom Workflows**: Define custom card states and transitions
- **Advanced Permissions**: Granular permission controls per board/card

---

## 📖 API Standards & Conventions

### URL Design
- Use plural nouns: `/workspaces/`, `/boards/`, `/cards/`
- Nested resources show relationships: `/boards/{id}/lists/`
- Custom actions use verbs at the end: `/boards/{id}/archive/`

### HTTP Methods
- `GET` - Retrieve resource(s)
- `POST` - Create new resource
- `PUT` - Full update (replace entire resource)
- `PATCH` - Partial update (modify specific fields)
- `DELETE` - Remove resource (soft delete by default)

### Naming Conventions
- JSON fields: `snake_case`
- Dates: ISO 8601 format (`2025-10-14T10:30:00Z`)
- Booleans: `is_`, `has_` prefixes (e.g., `is_archived`, `has_due_date`)

### Pagination
All list endpoints support pagination with:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Response includes:
- `count`: Total number of items
- `next`: URL to next page (null if last page)
- `previous`: URL to previous page (null if first page)
- `results`: Array of items

### Rate Limiting
- **Authenticated requests:** 1000 requests per hour per user
- **Unauthenticated requests:** 100 requests per hour per IP

Rate limit info is included in response headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1697280000
```

When rate limit is exceeded, API returns:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 60,
      "limit": 1000,
      "window": "1 hour"
    }
  }
}
```

---

## 🔒 Security Best Practices

### For API Consumers
1. **Never expose tokens**: Don't log or expose access/refresh tokens
2. **Use HTTPS only**: All requests must use secure connections
3. **Token refresh**: Implement automatic token refresh on 401 errors
4. **Logout on session end**: Always call `/auth/logout/` to invalidate tokens
5. **Validate inputs**: Always validate user inputs before sending to API

### CORS Policy
TaskNest API supports CORS for web applications. Allowed origins are configured per environment.

### Rate Limiting
Respect rate limits to ensure service availability for all users. Implement exponential backoff for retries.

---


**Version:** 1.0.0  
**Last Updated:** October 14, 2025  
