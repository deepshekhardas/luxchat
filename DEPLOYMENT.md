# 🚀 Deployment Guide

This MERN stack application is verified and ready for deployment. Follow these steps to host it for free/cheap.

## 1. 🔙 Backend Deployment (Render.com)

**Best for Node.js/Express APIs**

1.  **Push Code to GitHub**: Ensure your project is in a GitHub repository.
2.  **Create Web Service**:
    - Go to [Render Dashboard](https://dashboard.render.com/).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repo.
3.  **Settings**:
    - **Root Directory**: `.` (or leave empty if `package.json` is at root).
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
4.  **Environment Variables** (Add these in the Render "Environment" tab):
    - `NODE_ENV`: `production`
    - `MONGO_URI`: `your_mongodb_connection_string` (from MongoDB Atlas)
    - `JWT_SECRET`: `your_secret_key`
    - `GOOGLE_CLIENT_ID`: `your_google_client_id`
5.  **Deploy**: Click "Create Web Service". Render will give you a backend URL (e.g., `https://luxchat-api.onrender.com`).

---

## 2. 🎨 Frontend Deployment (Vercel)

**Best for React/Vite Apps**

1.  **Import Project**:
    - Go to [Vercel Dashboard](https://vercel.com/dashboard).
    - Click **Add New...** -> **Project**.
    - Select your GitHub repo.
2.  **Configure Project**:
    - **Framework Preset**: Select `Vite`.
    - **Root Directory**: Click "Edit" and select the `client` folder (IMPORTANT!).
3.  **Environment Variables**:
    - `VITE_BACKEND_URL`: The Render URL from Step 1 (e.g., `https://luxchat-api.onrender.com`).
    - `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID.
4.  **Deploy**: Click **Deploy**. Vercel will give you a live URL.

---

## 3. 🔄 Final Configuration

Once both are deployed:

1.  **Update Google Cloud Console**:
    - Add your **Vercel URL** (e.g., `https://luxchat.vercel.app`) to "Authorized JavaScript Origins".
2.  **Update Backend CORS** (Optional):
    - If you restricted CORS in `server.js`, update it to allow the Vercel domain.

**✅ Done! Your LuxChat is live.**
