import api from './api';

/**
 * AI Service - Frontend API calls for AI features
 */

/**
 * Chat with AI (Gemini)
 * @param {string} message - User message
 * @returns {Promise<{message: string, timestamp: Date}>}
 */
export const chatWithAI = async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data.data;
};

/**
 * Clear AI chat history
 */
export const clearAIHistory = async () => {
    const response = await api.delete('/ai/chat/history');
    return response.data;
};

/**
 * Analyze message sentiment
 * @param {string} message - Message to analyze
 * @returns {Promise<{label: string, score: number, emoji: string}>}
 */
export const analyzeSentiment = async (message) => {
    const response = await api.post('/ai/sentiment', { message });
    return response.data.data;
};

/**
 * Get smart reply suggestions
 * @param {string} message - Message to reply to
 * @param {string} context - Optional conversation context
 * @returns {Promise<{suggestions: string[]}>}
 */
export const getSmartReplies = async (message, context = '') => {
    const response = await api.post('/ai/smart-replies', { message, context });
    return response.data.data;
};

export default {
    chatWithAI,
    clearAIHistory,
    analyzeSentiment,
    getSmartReplies
};
