const jwt = require('jsonwebtoken');
const User = require('../models/User');
const messageService = require('../services/messageService');

// Map to track active users: userId -> socketId
const activeUsers = new Map();

const socketHandler = (io) => {
    // Middleware for Authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: No token'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // 1. User Online Status
        activeUsers.set(socket.user.id, socket.id);
        socket.user.status = 'online';
        socket.user.last_seen = new Date();
        await socket.user.save();

        // Broadcast online status to everyone (or just friends in v2)
        io.emit('user.online', { userId: socket.user.id });

        // Join own room for personal notifications
        socket.join(`user_${socket.user.id}`);


        // 2. Room Management (Join Conversations/Groups)
        socket.on('join', (rooms) => {
            // client sends array of room IDs (conv_id or group_id)
            if (Array.isArray(rooms)) {
                rooms.forEach(room => {
                    socket.join(room);
                    console.log(`User ${socket.user.name} joined room: ${room}`);
                });
            }
        });


        // 3. Real-Time Messaging (1-to-1 & Group)
        // Message structure: { targetId, text, isGroup }
        socket.on('message.send', async (data) => {
            try {
                const { targetId, text, isGroup } = data;

                // Save to DB using Service
                const message = await messageService.sendMessage(socket.user.id, targetId, text, isGroup);

                // Determine Room ID
                // For Group: targetId is group_id. Room: targetId
                // For DM: targetId is conversation_id. Room: targetId
                const roomId = targetId;

                // Emit to Room (including specific event for client convenience)
                // Use 'message.receive' for generic listener
                io.to(roomId).emit('message.receive', message);

                // Acknowledge receipt to sender (if needed for UI update)
                socket.emit('message.sent', { tempId: data.tempId, message });

                // --- LUXBOT INTEGRATION ---
                // Check if target is LuxBot
                // We need to fetch the target user to see if it's the bot, OR check against a known Bot ID/Email
                // For efficiency, we can check if the target User has a specific flag or email "luxbot@luxchat.com"
                if (!isGroup) {
                    const targetUser = await User.findById(targetId);
                    if (targetUser && targetUser.email === 'luxbot@luxchat.com') {
                        const botController = require('../controllers/botController');
                        botController.handleBotMessage(io, socket.user.id, text, targetUser);
                    }
                }
                // --------------------------

            } catch (error) {
                console.error('Message Send Error:', error);
                socket.emit('error', { message: error.message });
            }
        });


        // 4. Typing Indicators
        socket.on('typing.start', (data) => {
            const { roomId } = data; // conversation_id or group_id
            socket.to(roomId).emit('typing.start', {
                userId: socket.user.id,
                name: socket.user.name,
                roomId
            });
        });

        socket.on('typing.stop', (data) => {
            const { roomId } = data;
            socket.to(roomId).emit('typing.stop', {
                userId: socket.user.id,
                roomId
            });
        });

        // 5. Read Receipts
        socket.on('message.read', async (data) => {
            const { conversationId, groupId } = data;
            const isGroup = !!groupId;
            const targetId = groupId || conversationId;

            try {
                if (targetId) {
                    await messageService.markAsRead(targetId, socket.user.id, isGroup);

                    // Notify others in room
                    socket.to(targetId).emit('message.read', {
                        conversationId,
                        groupId,
                        userId: socket.user.id
                    });
                }
            } catch (e) {
                console.error(e);
            }
        });


        // 5. Disconnection
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.name}`);
            activeUsers.delete(socket.user.id);

            // Updates status to offline
            // Note: In production, consider a small delay to handle page reloads
            const user = await User.findById(socket.user.id);
            if (user) {
                user.status = 'offline';
                user.last_seen = new Date();
                await user.save();
            }

            io.emit('user.offline', { userId: socket.user.id, last_seen: new Date() });
        });
    });
};

module.exports = socketHandler;
