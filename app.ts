import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; // Socket.IO Server Type
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler';
import socketHandler from './socket/socketHandler';
import path from 'path';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import conversationRoutes from './routes/conversationRoutes';
import groupRoutes from './routes/groupRoutes';
import messageRoutes from './routes/messageRoutes';
import uploadRoutes from './routes/uploadRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev; restrict in production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());

const corsOptions = {
  origin: [
    'https://luxchat-n1ejld078-deepshekhardas1234-9292s-projects.vercel.app',
        'https://luxchat-kappa.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs. 'max' is deprecated in newer versions, use 'limit'
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static Folder for Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes); // AI Features

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Real-Time Chat Backend is running...');
});

// Error Handler
app.use(errorHandler);

// Socket.IO Handler
socketHandler(io);

export { app, server };

