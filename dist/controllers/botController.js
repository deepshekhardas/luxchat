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
exports.handleBotMessage = void 0;
const messageService_1 = __importDefault(require("../services/messageService"));
const geminiService_1 = require("../services/geminiService");
const sentimentService_1 = require("../services/sentimentService");
/**
 * Get AI response from Gemini (or fallback to pattern matching)
 */
const getBotResponse = (userId, text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Try Gemini first
        if (process.env.GEMINI_API_KEY) {
            return yield (0, geminiService_1.getGeminiResponse)(userId, text);
        }
    }
    catch (error) {
        console.error('Gemini fallback to pattern matching:', error.message);
    }
    // Fallback: Simple pattern matching
    const lowerText = text.toLowerCase();
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        return "👋 Hello! I'm LuxBot powered by AI. How can I help you today?";
    }
    if (lowerText.includes('help')) {
        return 'I can help you with:\n- 💬 General conversation\n- ❓ Answering questions\n- 🎯 Navigation help\n- 🤖 AI-powered chat!';
    }
    if (lowerText.includes('who are you')) {
        return "I'm LuxBot, your AI assistant powered by Google Gemini! 🤖";
    }
    if (lowerText.includes('bye')) {
        return 'Goodbye! Have a great day! 👋';
    }
    return "🤖 I'm here to help! Try asking me anything or say 'Help' for options.";
});
/**
 * Handle incoming message to bot
 */
const handleBotMessage = (io, senderId, text, botUser) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Analyze sentiment of user's message
        let sentimentEmoji = '';
        try {
            const sentiment = yield (0, sentimentService_1.analyzeSentiment)(text);
            sentimentEmoji = sentiment.emoji || '';
        }
        catch (e) {
            console.error('Sentiment analysis skipped:', e.message);
        }
        // 2. Simulate "Typing" delay
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            io.to(senderId).emit('typing.start', {
                userId: botUser._id,
                name: botUser.name,
                roomId: senderId
            });
            // 3. Generate AI Response
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                const responseText = yield getBotResponse(senderId, text);
                // Stop typing
                io.to(senderId).emit('typing.stop', {
                    userId: botUser._id,
                    roomId: senderId
                });
                // 4. Send Message
                const message = yield messageService_1.default.sendMessage(botUser._id.toString(), senderId, responseText, [], false);
                // Add sentiment info to message
                message.userSentiment = sentimentEmoji;
                // Emit to user
                io.to(senderId).emit('message.receive', message);
            }), 1500); // 1.5s typing duration
        }), 500); // 0.5s initial delay
    }
    catch (error) {
        console.error('Bot Error:', error);
    }
});
exports.handleBotMessage = handleBotMessage;
