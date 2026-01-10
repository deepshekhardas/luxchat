const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./socket/socketHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const groupRoutes = require('./routes/groupRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
    cors: {
        origin: '*', // Allow all origins for dev; restrict in production
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
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
app.use('/api/upload', uploadRoutes); // NEW

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Real-Time Chat Backend is running...');
});

// Error Handler
app.use(errorHandler);

// Socket.IO Handler
socketHandler(io);

module.exports = { app, server };
