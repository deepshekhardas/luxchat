var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Conversation = require('../models/Conversation');
class ConversationService {
    getConversations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch conversations where user is a participant
            const conversations = yield Conversation.find({
                participants: { $in: [userId] }
            })
                .populate('participants', 'name profile_pic status last_seen')
                .sort({ updatedAt: -1 });
            return conversations;
        });
    }
    getOrCreateConversation(user1, user2) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if conversation exists
            let conversation = yield Conversation.findOne({
                participants: { $all: [user1, user2] }
            }).populate('participants', 'name profile_pic status');
            if (!conversation) {
                conversation = yield Conversation.create({
                    participants: [user1, user2],
                    unread_counts: {
                        [user1]: 0,
                        [user2]: 0
                    }
                });
                // Re-fetch to populate
                conversation = yield Conversation.findById(conversation._id).populate('participants', 'name profile_pic status');
            }
            return conversation;
        });
    }
}
module.exports = new ConversationService();
