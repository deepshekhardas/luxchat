"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Group_1 = __importDefault(require("../models/Group"));
class MessageService {
    sendMessage(senderId_1, targetId_1, text_1) {
        return __awaiter(this, arguments, void 0, function* (senderId, targetId, text, attachments = [], isGroup = false) {
            let message;
            if (isGroup) {
                // @ts-ignore
                const group = yield Group_1.default.findById(targetId);
                if (!group)
                    throw new Error('Group not found');
                // @ts-ignore
                if (!group.members.includes(senderId))
                    throw new Error('Not a member of this group');
                message = yield Message_1.default.create({
                    // @ts-ignore
                    sender: senderId,
                    // @ts-ignore
                    group_id: targetId,
                    text,
                    attachments,
                    status: 'sent'
                });
                // Update Group last message
                group.last_message = {
                    text,
                    // @ts-ignore
                    sender: senderId,
                    createdAt: new Date()
                };
                group.updatedAt = new Date();
                yield group.save();
            }
            else {
                let conversation = yield Conversation_1.default.findById(targetId);
                if (!conversation) {
                    throw new Error('Conversation not found');
                }
                message = yield Message_1.default.create({
                    // @ts-ignore
                    sender: senderId,
                    // @ts-ignore
                    // @ts-ignore
                    conversation_id: targetId,
                    text,
                    attachments,
                    status: 'sent'
                });
                // Update Conversation last message and unread counts
                conversation.last_message = {
                    text,
                    // @ts-ignore
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
            const messages = yield Message_1.default.find(query)
                .sort({ createdAt: -1 }) // Newest first for pagination
                .skip(skip)
                .limit(limit)
                .populate('sender', 'name profile_pic');
            return messages.reverse(); // Return oldest first for chat view
        });
    }
    markAsRead(targetId_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (targetId, userId, isGroup = false) {
            if (!isGroup) {
                yield Message_1.default.updateMany({ conversation_id: targetId, sender: { $ne: userId }, status: { $ne: 'read' } }, { $set: { status: 'read' } });
                // Reset unread count
                const conversation = yield Conversation_1.default.findById(targetId);
                if (conversation) {
                    conversation.unread_counts.set(userId.toString(), 0);
                    yield conversation.save();
                }
            }
        });
    }
}
exports.default = new MessageService();
