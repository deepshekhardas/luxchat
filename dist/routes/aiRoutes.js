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
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../middleware/auth");
const geminiService_1 = require("../services/geminiService");
const sentimentService_1 = require("../services/sentimentService");
const smartReplyService_1 = require("../services/smartReplyService");
const router = express_1.default.Router();
// AI Rate Limiter (50 requests per hour)
const aiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 50, // Use limit instead of max
    message: 'Too many AI requests, please try again later.'
});
// Apply limiter to all AI routes
router.use(aiLimiter);
/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI (Gemini)
 * @access  Private
 */
router.post('/chat', auth_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        const response = yield (0, geminiService_1.getGeminiResponse)(req.user._id.toString(), message);
        res.json({
            success: true,
            data: {
                message: response,
                timestamp: new Date()
            }
        });
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'AI service error', error: error.message });
    }
}));
/**
 * @route   DELETE /api/ai/chat/history
 * @desc    Clear AI chat history
 * @access  Private
 */
router.delete('/chat/history', auth_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, geminiService_1.clearHistory)(req.user._id.toString());
        res.json({ success: true, message: 'Chat history cleared' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error clearing history' });
    }
}));
/**
 * @route   POST /api/ai/sentiment
 * @desc    Analyze message sentiment
 * @access  Private
 */
router.post('/sentiment', auth_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        const sentiment = yield (0, sentimentService_1.analyzeSentiment)(message);
        res.json({
            success: true,
            data: sentiment
        });
    }
    catch (error) {
        console.error('Sentiment Error:', error);
        res.status(500).json({ message: 'Sentiment analysis error' });
    }
}));
/**
 * @route   POST /api/ai/smart-replies
 * @desc    Get smart reply suggestions
 * @access  Private
 */
router.post('/smart-replies', auth_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, context } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        const replies = yield (0, smartReplyService_1.getSmartReplies)(message, context || '');
        res.json({
            success: true,
            data: {
                suggestions: replies
            }
        });
    }
    catch (error) {
        console.error('Smart Reply Error:', error);
        res.status(500).json({ message: 'Smart reply error' });
    }
}));
exports.default = router;
