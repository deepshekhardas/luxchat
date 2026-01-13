const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Group = require('../models/Group');

class MessageService {
  async sendMessage(senderId, targetId, text, attachments = [], isGroup = false) {
    let message;

    if (isGroup) {
      const group = await Group.findById(targetId);
      if (!group) throw new Error('Group not found');
      if (!group.members.includes(senderId)) throw new Error('Not a member of this group');

      message = await Message.create({
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
      await group.save();
    } else {
      // Target is a Conversation ID or User ID?
      // For simplicity, let's assume targetId passed here is the CONVERSATION ID
      // (Client should get convId first or backend resolves it).
      // However, usually API passes Recipient ID. Let's support Conversation ID for now
      // as it connects to the room.

      // Actually, logic is cleaner if we ensure a conversation exists first.
      let conversation = await Conversation.findById(targetId);

      if (!conversation) {
        // Fallback: if client passed a User ID, try to find conv
        // This logic might be better placed in the controller, keeping service simple:
        // "Input is strictly Conversation ID"
        throw new Error('Conversation not found');
      }

      message = await Message.create({
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

      await conversation.save();
    }

    return await message.populate('sender', 'name profile_pic');
  }

  async getMessages(targetId, isGroup = false, limit = 50, skip = 0) {
    const query = isGroup ? { group_id: targetId } : { conversation_id: targetId };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // Newest first for pagination
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name profile_pic');

    return messages.reverse(); // Return oldest first for chat view
  }

  async markAsRead(targetId, userId, isGroup = false) {
    // Logic to mark all messages in targetId as read by userId
    // For 1-on-1: Update status='read' for messages where sender != userId
    // For Group: Complex (needs 'readBy' array in Message model). Skipping strict DB update for Group MVP.

    if (!isGroup) {
      await Message.updateMany(
        { conversation_id: targetId, sender: { $ne: userId }, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );

      // Reset unread count
      const conversation = await Conversation.findById(targetId);
      if (conversation) {
        conversation.unread_counts.set(userId.toString(), 0);
        await conversation.save();
      }
    }
  }
}

module.exports = new MessageService();
