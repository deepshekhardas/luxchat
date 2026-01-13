# 🚀 LuxChat - Premium Real-Time Messaging Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)

**LuxChat** is a state-of-the-art, real-time messaging application featuring a lavish glassmorphism UI, robust security, and seamless performance. Built for scalability and user engagement.

## ✨ Key Features

- **💎 Lavish UI/UX**: Global dark mode, glassmorphism components, and fluid Framer Motion animations.
- **⚡ Real-Time Messaging**: Powered by Socket.IO for instant delivery.
- **🔐 Secure Authentication**: JWT-based auth + Google OAuth integration.
- **👥 Group Chats**: Create, manage, and chat in dynamic groups.
- **📹 Video Calling**: 1-to-1 video calls with WebRTC.
- **📁 File Sharing**: Drag-and-drop image uploads with instant preview.
- **🔔 Smart Notifications**: Real-time alerts and unread message counters.
- **🔎 User Search**: Instant user discovery and connection.
- **😀 Emoji Support**: Full rich-text experience with emoji integration.
- **🤖 AI Chatbot**: LuxBot powered by OpenAI for intelligent conversations.

## 🛠️ Tech Stack

### Frontend

- **React 18** (Vite)
- **TailwindCSS** (Styling & Animation)
- **Framer Motion** (Micro-interactions)
- **Socket.IO Client** (Real-time connection)
- **Lucide React** (Modern Iconography)

### Backend

- **Node.js & Express**
- **MongoDB** (Persistence)
- **Socket.IO** (WebSockets)
- **Multer + Cloudinary** (File Handling)
- **JWT** (Stateless Authentication)

## 📡 API Endpoints

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| POST   | `/api/auth/register` | Register new user         |
| POST   | `/api/auth/login`    | Login with email/password |
| POST   | `/api/auth/google`   | Login with Google OAuth   |
| GET    | `/api/auth/me`       | Get current user profile  |
| GET    | `/api/users/search`  | Search users              |
| GET    | `/api/conversations` | Get all conversations     |
| POST   | `/api/conversations` | Create/get conversation   |
| GET    | `/api/groups`        | Get user's groups         |
| POST   | `/api/groups`        | Create a group            |
| GET    | `/api/messages/:id`  | Get messages              |
| POST   | `/api/upload/image`  | Upload image              |

📚 Full API documentation: [API_DOCS.md](./API_DOCS.md)

## ⚙️ Environment Variables

| Variable                | Description                    | Required    |
| ----------------------- | ------------------------------ | ----------- |
| `PORT`                  | Server port (default: 5001)    | No          |
| `MONGO_URI`             | MongoDB connection string      | ✅          |
| `JWT_SECRET`            | Secret for JWT tokens          | ✅          |
| `JWT_EXPIRE`            | Token expiration (e.g., "30d") | ✅          |
| `GOOGLE_CLIENT_ID`      | Google OAuth Client ID         | For OAuth   |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name          | For uploads |
| `CLOUDINARY_API_KEY`    | Cloudinary API key             | For uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret          | For uploads |
| `OPENAI_API_KEY`        | OpenAI API key                 | For LuxBot  |

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (Running locally on port 27017)

### Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/luxchat.git
    cd luxchat
    ```

2.  **Backend Setup**

    ```bash
    npm install
    cp .env.example .env
    # Edit .env with your configuration
    npm start
    # Server runs on http://localhost:5001
    ```

3.  **Frontend Setup**

    ```bash
    cd client
    npm install
    npm run dev
    # App runs on http://localhost:5173
    ```

4.  **Run Tests**
    ```bash
    npm test
    ```

## 🧪 Testing

The project includes comprehensive unit tests for:

- `authService` - Registration, login, logout
- `messageService` - Sending, fetching, read receipts
- `conversationService` - Creating and listing conversations
- `userService` - User search and profiles

Run tests with: `npm test`

## 🤝 Contribution

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a step-by-step guide to deploying on Render (Backend) and Vercel (Frontend).

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

_Built with ❤️ - Production Ready Real-Time Chat Application_
