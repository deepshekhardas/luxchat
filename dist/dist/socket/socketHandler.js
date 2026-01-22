var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const messageService = require('../services/messageService');
// Map to track active users: userId -> socketId
const activeUsers = new Map();
const socketHandler = (io) => {
    // Middleware for Authentication
    io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: No token'));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = yield User.findById(decoded.id);
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            socket.user = user;
            next();
        }
        catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    }));
    io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);
        // 1. User Online Status
        activeUsers.set(socket.user.id, socket.id);
        socket.user.status = 'online';
        socket.user.last_seen = new Date();
        yield socket.user.save();
        // Broadcast online status to everyone (or just friends in v2)
        io.emit('user.online', { userId: socket.user.id });
        // Join own room for personal notifications
        socket.join(`user_${socket.user.id}`);
        // 2. Room Management (Join Conversations/Groups)
        socket.on('join', (rooms) => {
            // client sends array of room IDs (conv_id or group_id)
            if (Array.isArray(rooms)) {
                rooms.forEach((room) => {
                    socket.join(room);
                    console.log(`User ${socket.user.name} joined room: ${room}`);
                });
            }
        });
        // 3. Real-Time Messaging (1-to-1 & Group)
        // Message structure: { targetId, text, isGroup }
        socket.on('message.send', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { targetId, text, isGroup } = data;
                // Save to DB using Service
                const message = yield messageService.sendMessage(socket.user.id, targetId, text, isGroup);
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
                    const targetUser = yield User.findById(targetId);
                    if (targetUser && targetUser.email === 'luxbot@luxchat.com') {
                        const botController = require('../controllers/botController');
                        botController.handleBotMessage(io, socket.user.id, text, targetUser);
                    }
                }
                // --------------------------
            }
            catch (error) {
                console.error('Message Send Error:', error);
                socket.emit('error', { message: error.message });
            }
        }));
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
        socket.on('message.read', (data) => __awaiter(this, void 0, void 0, function* () {
            const { conversationId, groupId } = data;
            const isGroup = !!groupId;
            const targetId = groupId || conversationId;
            try {
                if (targetId) {
                    yield messageService.markAsRead(targetId, socket.user.id, isGroup);
                    // Notify others in room
                    socket.to(targetId).emit('message.read', {
                        conversationId,
                        groupId,
                        userId: socket.user.id
                    });
                }
            }
            catch (e) {
                console.error(e);
            }
        }));
        // 6. WebRTC Video Calling Signaling
        // Track users currently in a call
        if (!socket.inCall)
            socket.inCall = false;
        socket.on('calluser', ({ userToCall, signalData, from, name }) => {
            // from is the socket ID or user ID
            // userToCall is the User ID we want to call
            // We need to find the socket ID for userToCall
            const socketIdToCall = activeUsers.get(userToCall);
            if (!socketIdToCall) {
                // User is offline or not found
                socket.emit('call_declined', { message: 'User is offline', reason: 'offline' });
                return;
            }
            // Check if the target user is already in a call
            const targetSocket = io.sockets.sockets.get(socketIdToCall);
            if (targetSocket && targetSocket.inCall) {
                socket.emit('call_declined', { message: 'User is busy on another call', reason: 'busy' });
                return;
            }
            // Mark caller as in call
            socket.inCall = true;
            // Set call timeout (30 seconds)
            const callTimeout = setTimeout(() => {
                if (socket.inCall && !socket.callAccepted) {
                    socket.emit('call_timeout', { message: 'Call was not answered' });
                    socket.inCall = false;
                    io.to(socketIdToCall).emit('call_missed', { from, name });
                }
            }, 30000);
            socket.callTimeout = callTimeout;
            socket.callAccepted = false;
            io.to(socketIdToCall).emit('calluser', {
                signal: signalData,
                from: from, // User ID of caller
                name: name
            });
        });
        socket.on('answercall', (data) => {
            const callerSocketId = activeUsers.get(data.to); // data.to is caller's User ID
            if (callerSocketId) {
                const callerSocket = io.sockets.sockets.get(callerSocketId);
                if (callerSocket) {
                    callerSocket.callAccepted = true;
                    if (callerSocket.callTimeout) {
                        clearTimeout(callerSocket.callTimeout);
                    }
                }
                socket.inCall = true; // Mark receiver as in call
                io.to(callerSocketId).emit('callaccepted', data.signal);
            }
        });
        // Reject incoming call
        socket.on('rejectcall', ({ to, reason }) => {
            const callerSocketId = activeUsers.get(to);
            if (callerSocketId) {
                const callerSocket = io.sockets.sockets.get(callerSocketId);
                if (callerSocket && callerSocket.callTimeout) {
                    clearTimeout(callerSocket.callTimeout);
                    callerSocket.inCall = false;
                }
                io.to(callerSocketId).emit('call_declined', {
                    message: reason || 'Call was declined',
                    reason: 'rejected'
                });
            }
        });
        // Handle ICE candidates if strictly needed (simple-peer handles this in signal usually, but for better stability:)
        // Simple-peer encapsulates everything in 'signal', so the above two are often enough.
        // End Call
        socket.on('callended', ({ to }) => {
            const socketIdToCall = activeUsers.get(to);
            // Clear caller's call state
            socket.inCall = false;
            if (socket.callTimeout) {
                clearTimeout(socket.callTimeout);
            }
            if (socketIdToCall) {
                const targetSocket = io.sockets.sockets.get(socketIdToCall);
                if (targetSocket) {
                    targetSocket.inCall = false;
                }
                io.to(socketIdToCall).emit('callended');
            }
        });
        // 7. Disconnection
        socket.on('disconnect', () => __awaiter(this, void 0, void 0, function* () {
            console.log(`User disconnected: ${socket.user.name}`);
            activeUsers.delete(socket.user.id);
            // Updates status to offline
            // Note: In production, consider a small delay to handle page reloads
            const user = yield User.findById(socket.user.id);
            if (user) {
                user.status = 'offline';
                user.last_seen = new Date();
                yield user.save();
            }
            io.emit('user.offline', { userId: socket.user.id, last_seen: new Date() });
            // Also emit call ended if in a call? (Client handles this usually via peer close)
        }));
    }));
};
module.exports = socketHandler;
