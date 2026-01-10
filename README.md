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
- **📁 File Sharing**: Drag-and-drop image uploads with instant preview.
- **🔔 Smart Notifications**: Real-time alerts and unread message counters.
- **🔎 User Search**: Instant user discovery and connection.
- **😀 Emoji Support**: Full rich-text experience with emoji integration.

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
- **Multer** (File Handling)
- **JWT** (Stateless Authentication)

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
    cd backend (or root if combined)
    npm install
    
    # Configure .env
    # Create a .env file based on .env.example
    # Ensure MONGO_URI and JWT_SECRET are set
    
    npm start
    # Server runs on http://localhost:5001
    ```

3.  **Frontend Setup**
    ```bash
    cd client
    npm install
    npm run dev
    # App runs on http://localhost:5174
    ```

## 📸 Screenshots

*(Add your screenshots here for the Upwork portfolio)*

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
*Built with ❤️ by [Your Name] - Ready for Production.*
