const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getGeminiResponse, clearHistory } = require('../services/geminiService');
const { analyzeSentiment } = require('../services/sentimentService');
const { getSmartReplies } = require('../services/smartReplyService');

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI (Gemini)
 * @access  Private
 */
router.post('/chat', protect, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const response = await getGeminiResponse(req.user._id.toString(), message);

        res.json({
            success: true,
            data: {
                message: response,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'AI service error', error: error.message });
    }
});

/**
 * @route   DELETE /api/ai/chat/history
 * @desc    Clear AI chat history
 * @access  Private
 */
router.delete('/chat/history', protect, async (req, res) => {
    try {
        clearHistory(req.user._id.toString());
        res.json({ success: true, message: 'Chat history cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing history' });
    }
});

/**
 * @route   POST /api/ai/sentiment
 * @desc    Analyze message sentiment
 * @access  Private
 */
router.post('/sentiment', protect, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const sentiment = await analyzeSentiment(message);

        res.json({
            success: true,
            data: sentiment
        });
    } catch (error) {
        console.error('Sentiment Error:', error);
        res.status(500).json({ message: 'Sentiment analysis error' });
    }
});

/**
 * @route   POST /api/ai/smart-replies
 * @desc    Get smart reply suggestions
 * @access  Private
 */
router.post('/smart-replies', protect, async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const replies = await getSmartReplies(message, context || '');

        res.json({
            success: true,
            data: {
                suggestions: replies
            }
        });
    } catch (error) {
        console.error('Smart Reply Error:', error);
        res.status(500).json({ message: 'Smart reply error' });
    }
});

module.exports = router;
