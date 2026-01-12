# 📚 LuxChat API Documentation

## Base URL
```
Development: http://localhost:5001/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Auth Endpoints

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token"
  }
}
```

---

### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token"
  }
}
```

---

### POST `/auth/google`
Login with Google OAuth token.

**Request Body:**
```json
{
  "token": "google_id_token"
}
```

---

### POST `/auth/logout` 🔒
Logout current user.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/auth/me` 🔒
Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "online"
  }
}
```

---

## 👥 User Endpoints

### GET `/users/search?q=keyword` 🔒
Search for users by name or email.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| q | string | Search keyword |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profile_pic": "url",
      "status": "online"
    }
  ]
}
```

---

## 💬 Conversation Endpoints

### GET `/conversations` 🔒
Get all conversations for current user.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "conv_id",
      "participants": [...],
      "last_message": {...},
      "unread_counts": {}
    }
  ]
}
```

---

### POST `/conversations` 🔒
Create or get existing conversation with a user.

**Request Body:**
```json
{
  "userId": "target_user_id"
}
```

---

## 👥 Group Endpoints

### GET `/groups` 🔒
Get all groups for current user.

---

### POST `/groups` 🔒
Create a new group.

**Request Body:**
```json
{
  "name": "Group Name",
  "members": ["user_id_1", "user_id_2"]
}
```

---

## 📨 Message Endpoints

### GET `/messages/:targetId?isGroup=false` 🔒
Get messages for a conversation or group.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| isGroup | boolean | true for group messages |
| limit | number | Messages per page (default: 50) |
| skip | number | Offset for pagination |

---

### POST `/messages` 🔒
Send a message (typically done via Socket.IO).

---

## 📤 Upload Endpoints

### POST `/upload/image` 🔒
Upload an image to Cloudinary.

**Request:** `multipart/form-data` with `image` field.

**Response (200):**
```json
{
  "success": true,
  "url": "https://cloudinary.com/..."
}
```

---

## 🔌 Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `[roomIds]` | Join conversation/group rooms |
| `message.send` | `{targetId, text, isGroup}` | Send message |
| `typing.start` | `{roomId}` | Start typing indicator |
| `typing.stop` | `{roomId}` | Stop typing indicator |
| `message.read` | `{conversationId, groupId}` | Mark messages as read |
| `calluser` | `{userToCall, signalData, from, name}` | Initiate video call |
| `answercall` | `{signal, to}` | Answer video call |
| `callended` | `{to}` | End video call |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message.receive` | `Message` | New message received |
| `message.sent` | `{tempId, message}` | Message sent confirmation |
| `typing.start` | `{userId, name, roomId}` | User started typing |
| `typing.stop` | `{userId, roomId}` | User stopped typing |
| `user.online` | `{userId}` | User came online |
| `user.offline` | `{userId, last_seen}` | User went offline |
| `calluser` | `{signal, from, name}` | Incoming call |
| `callaccepted` | `signal` | Call was accepted |
| `callended` | - | Call ended |
| `call_declined` | `{message}` | Call was declined |

---

## ⚠️ Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/expired token |
| 403 | Forbidden - Not authorized for resource |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Server Error |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "stack": "(only in development)"
}
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5001) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | Token expiration (e.g., "30d") |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `OPENAI_API_KEY` | OpenAI API key for LuxBot |

---

🔒 = Requires Authentication
