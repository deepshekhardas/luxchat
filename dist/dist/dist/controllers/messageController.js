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
const messageService = require('../services/messageService');
const sendMessage = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const { recipient_id, group_id, text, attachments } = req.body;
    let message;
    if (group_id) {
        message = yield messageService.sendMessage(req.user.id, group_id, text, attachments, true);
    }
    else if (recipient_id) {
        // Here recipient_id might be a Conversation ID depending on API design
        // Let's assume for consistency with Service it expects Conversation ID
        // OR implement a logic to resolve Conv ID from Recipient User ID here
        // If the frontend sends the Conversation ID directly (preferred for performance)
        message = yield messageService.sendMessage(req.user.id, recipient_id, text, attachments, false);
    }
    else {
        res.status(400);
        throw new Error('Recipient or Group ID required');
    }
    res.status(201).json({
        success: true,
        data: message
    });
}));
const getMessages = asyncHandler((req, res) => __awaiter(this, void 0, void 0, function* () {
    const { targetId } = req.params; // Conversation or Group ID
    const isGroup = req.query.isGroup === 'true';
    const messages = yield messageService.getMessages(targetId, isGroup);
    res.json({
        success: true,
        count: messages.length,
        data: messages
    });
}));
module.exports = { sendMessage, getMessages };
