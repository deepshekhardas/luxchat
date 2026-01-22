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
const asyncHandler = require('express-async-handler');
const conversationService = require('../services/conversationService');
const getConversations = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const conversations = yield conversationService.getConversations(req.user.id);
    res.json({
        success: true,
        count: conversations.length,
        data: conversations
    });
}));
const createConversation = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const { userId } = req.body; // Target user ID
    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }
    const conversation = yield conversationService.getOrCreateConversation(req.user.id, userId);
    res.status(201).json({
        success: true,
        data: conversation
    });
}));
module.exports = { getConversations, createConversation };
