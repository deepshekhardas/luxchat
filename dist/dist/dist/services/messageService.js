var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            }
        }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Group = require('../models/Group');
class MessageService {
    sendMessage(senderId_1, targetId_1, text_1) {
        return __awaiter(this, arguments, void 0, function* (senderId, targetId, text, attachments = [], isGroup = false) {
            let message;
            if (isGroup) {
                const group = yield Group.findById(targetId);
                if (!group)
                    throw new Error('Group not found');
                if (!group.members.includes(senderId))
                    throw new Error('Not a member of this group');
                message = yield Message.create({
                    sender: senderId,
                    group_id: targetId,
                    text,
                    attachments,
                    status: 'sent'
                });
                // Update Group last message
                group.last_message = {
                    text,
                    sender: senderId,
                    createdAt: new Date()
                };
                group.updatedAt = new Date();
                yield group.save();
            }
            else {
                // Target is a Conversation ID or User ID?
                // For simplicity, let's assume targetId passed here is the CONVERSATION ID
                // (Client should get convId first or backend resolves it).
                // However, usually API passes Recipient ID. Let's support Conversation ID for now
                // as it connects to the room.
                // Actually, logic is cleaner if we ensure a conversation exists first.
                let conversation = yield Conversation.findById(targetId);
                if (!conversation) {
                    // Fallback: if client passed a User ID, try to find conv
                    // This logic might be better placed in the controller, keeping service simple:
                    // "Input is strictly Conversation ID"
                    throw new Error('Conversation not found');
                }
                message = yield Message.create({
                    sender: senderId,
                    conversation_id: targetId,
                    text,
                    attachments,
                    status: 'sent'
                });
                // Update Conversation last message and unread counts
                conversation.last_message = {
                    text,
                    sender: senderId,
                    createdAt: new Date()
                };
                conversation.updatedAt = new Date();
                // Increment unread count for the OTHER participant
                const otherUser = conversation.participants.find((p) => p.toString() !== senderId.toString());
                if (otherUser) {
                    const currentCount = conversation.unread_counts.get(otherUser.toString()) || 0;
                    conversation.unread_counts.set(otherUser.toString(), currentCount + 1);
                }
                yield conversation.save();
            }
            return yield message.populate('sender', 'name profile_pic');
        });
    }
    getMessages(targetId_1) {
        return __awaiter(this, arguments, void 0, function* (targetId, isGroup = false, limit = 50, skip = 0) {
            const query = isGroup ? { group_id: targetId } : { conversation_id: targetId };
            const messages = yield Message.find(query)
                .sort({ createdAt: -1 }) // Newest first for pagination
                .skip(skip)
                .limit(limit)
                .populate('sender', 'name profile_pic');
            return messages.reverse(); // Return oldest first for chat view
        });
    }
    markAsRead(targetId_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (targetId, userId, isGroup = false) {
            // Logic to mark all messages in targetId as read by userId
            // For 1-on-1: Update status='read' for messages where sender != userId
            // For Group: Complex (needs 'readBy' array in Message model). Skipping strict DB update for Group MVP.
            if (!isGroup) {
                yield Message.updateMany({ conversation_id: targetId, sender: { $ne: userId }, status: { $ne: 'read' } }, { $set: { status: 'read' } });
                // Reset unread count
                const conversation = yield Conversation.findById(targetId);
                if (conversation) {
                    conversation.unread_counts.set(userId.toString(), 0);
                    yield conversation.save();
                }
            }
        });
    }
}
module.exports = new MessageService();
