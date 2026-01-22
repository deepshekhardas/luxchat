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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearHistory = exports.getGeminiResponse = void 0;
const generative_ai_1 = require("@google/generative-ai");
const redis_1 = require("../config/redis");
// Initialize Gemini
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Memory fallback if Redis fails
const memoryHistory = new Map();
/**
 * Get AI response from Gemini
 * @param {string} userId - User ID for chat history
 * @param {string} message - User message
 * @returns {Promise<string>} AI response
 */
const getGeminiResponse = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "⚠️ Gemini API key not configured. Please add GEMINI_API_KEY to your environment.";
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        // Retrieve History from Redis
        let history = [];
        const historyKey = `chat_history:${userId}`;
        try {
            if (redis_1.redisClient.isOpen) {
                const data = yield redis_1.redisClient.get(historyKey);
                history = data ? JSON.parse(data) : [];
            }
            else {
                history = memoryHistory.get(userId) || [];
            }
        }
        catch (err) {
            console.error('Redis Get Error:', err);
            history = memoryHistory.get(userId) || [];
        }
        // Start chat with history
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
        });
        // Send message and get response
        const result = yield chat.sendMessage(message);
        const response = result.response.text();
        // Update history
        history.push({ role: 'user', parts: [{ text: message }] });
        history.push({ role: 'model', parts: [{ text: response }] });
        // Keep last 20 messages
        if (history.length > 20) {
            history = history.slice(-20);
        }
        // Save History to Redis (Expire in 24 hours)
        try {
            if (redis_1.redisClient.isOpen) {
                yield redis_1.redisClient.setEx(historyKey, 86400, JSON.stringify(history));
            }
            else {
                memoryHistory.set(userId, history);
            }
        }
        catch (err) {
            console.error('Redis Set Error:', err);
            memoryHistory.set(userId, history);
        }
        return response;
    }
    catch (error) {
        console.error('Gemini Error:', error.message);
        if (error.message.includes('API key')) {
            return "⚠️ Invalid Gemini API key. Please check your configuration.";
        }
        if (error.message.includes('quota')) {
            return "⏳ AI quota exceeded. Please try again later.";
        }
        return "🤖 I'm having trouble connecting right now. Please try again!";
    }
});
exports.getGeminiResponse = getGeminiResponse;
/**
 * Clear chat history for a user
 */
const clearHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const historyKey = `chat_history:${userId}`;
        if (redis_1.redisClient.isOpen) {
            yield redis_1.redisClient.del(historyKey);
        }
        memoryHistory.delete(userId);
        return true;
    }
    catch (error) {
        console.error('Clear History Error:', error);
        return false;
    }
});
exports.clearHistory = clearHistory;
