const asyncHandler = require('express-async-handler');
const conversationService = require('../services/conversationService');

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await conversationService.getConversations(req.user.id);
  res.json({
    success: true,
    count: conversations.length,
    data: conversations
  });
});

const createConversation = asyncHandler(async (req, res) => {
  const { userId } = req.body; // Target user ID
  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  const conversation = await conversationService.getOrCreateConversation(req.user.id, userId);
  res.status(201).json({
    success: true,
    data: conversation
  });
});

module.exports = { getConversations, createConversation };
