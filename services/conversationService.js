const Conversation = require('../models/Conversation');

class ConversationService {
  async getConversations(userId) {
    // Fetch conversations where user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [userId] }
    })
      .populate('participants', 'name profile_pic status last_seen')
      .sort({ updatedAt: -1 });

    return conversations;
  }

  async getOrCreateConversation(user1, user2) {
    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] }
    }).populate('participants', 'name profile_pic status');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [user1, user2],
        unread_counts: {
          [user1]: 0,
          [user2]: 0
        }
      });
      // Re-fetch to populate
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name profile_pic status'
      );
    }

    return conversation;
  }
}

module.exports = new ConversationService();
