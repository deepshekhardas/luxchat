const asyncHandler = require('express-async-handler');
const messageService = require('../services/messageService');

const sendMessage = asyncHandler(async (req, res) => {
    const { recipient_id, group_id, text, attachments } = req.body;
    let message;

    if (group_id) {
        message = await messageService.sendMessage(req.user.id, group_id, text, attachments, true);
    } else if (recipient_id) {
        // Here recipient_id might be a Conversation ID depending on API design
        // Let's assume for consistency with Service it expects Conversation ID 
        // OR implement a logic to resolve Conv ID from Recipient User ID here

        // If the frontend sends the Conversation ID directly (preferred for performance)
        message = await messageService.sendMessage(req.user.id, recipient_id, text, attachments, false);
    } else {
        res.status(400);
        throw new Error('Recipient or Group ID required');
    }

    res.status(201).json({
        success: true,
        data: message
    });
});

const getMessages = asyncHandler(async (req, res) => {
    const { targetId } = req.params; // Conversation or Group ID
    const isGroup = req.query.isGroup === 'true';

    const messages = await messageService.getMessages(targetId, isGroup);
    res.json({
        success: true,
        count: messages.length,
        data: messages
    });
});

module.exports = { sendMessage, getMessages };
