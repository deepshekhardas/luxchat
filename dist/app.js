"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io"); // Socket.IO Server Type
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const socketHandler_1 = __importDefault(require("./socket/socketHandler"));
const path_1 = __importDefault(require("path"));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const conversationRoutes_1 = __importDefault(require("./routes/conversationRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow all origins for dev; restrict in production
        methods: ['GET', 'POST']
    }
});
// Middleware
app.use((0, helmet_1.default)());
const corsOptions = {
    origin: [
        'https://luxchat-n1ejld078-deepshekhardas1234-9292s-projects.vercel.app',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Global Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs. 'max' is deprecated in newer versions, use 'limit'
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Static Folder for Uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Mount Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/conversations', conversationRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default); // AI Features
// Root Endpoint
app.get('/', (req, res) => {
    res.send('Real-Time Chat Backend is running...');
});
// Error Handler
app.use(errorHandler_1.default);
// Socket.IO Handler
(0, socketHandler_1.default)(io);
