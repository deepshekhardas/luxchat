import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Group from '../models/Group';

class MessageService {
  async sendMessage(senderId: string, targetId: string, text: string, attachments: any[] = [], isGroup: boolean = false) {
    let message;

    if (isGroup) {
      // @ts-ignore
      const group = await Group.findById(targetId);
      if (!group) throw new Error('Group not found');

      // @ts-ignore
      if (!group.members.includes(senderId)) throw new Error('Not a member of this group');

      message = await Message.create({

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
      await group.save();
    } else {
      let conversation = await Conversation.findById(targetId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      message = await Message.create({
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
      const otherUser = conversation.participants.find((p: any) => p.toString() !== senderId.toString());
      if (otherUser) {
        const currentCount = conversation.unread_counts.get(otherUser.toString()) || 0;
        conversation.unread_counts.set(otherUser.toString(), currentCount + 1);
      }

      await conversation.save();
    }

    return await message.populate('sender', 'name profile_pic');
  }

  async getMessages(targetId: string, isGroup: boolean = false, limit: number = 50, skip: number = 0) {
    const query = isGroup ? { group_id: targetId } : { conversation_id: targetId };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // Newest first for pagination
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name profile_pic');

    return messages.reverse(); // Return oldest first for chat view
  }

  async markAsRead(targetId: string, userId: string, isGroup: boolean = false) {
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

export default new MessageService();


