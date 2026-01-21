const { GoogleGenerativeAI } = require('@google/generative-ai');
const { redisClient } = require('../config/redis');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Memory fallback if Redis fails
const memoryHistory = new Map();

/**
 * Get AI response from Gemini
 * @param {string} userId - User ID for chat history
 * @param {string} message - User message
 * @returns {Promise<string>} AI response
 */
const getGeminiResponse = async (userId, message) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "⚠️ Gemini API key not configured. Please add GEMINI_API_KEY to your environment.";
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Retrieve History from Redis
    let history = [];
    const historyKey = `chat_history:${userId}`;

    try {
      if (redisClient.isOpen) {
        const data = await redisClient.get(historyKey);
        history = data ? JSON.parse(data) : [];
      } else {
        history = memoryHistory.get(userId) || [];
      }
    } catch (err) {
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
    const result = await chat.sendMessage(message);
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
      if (redisClient.isOpen) {
        await redisClient.setEx(historyKey, 86400, JSON.stringify(history));
      } else {
        memoryHistory.set(userId, history);
      }
    } catch (err) {
      console.error('Redis Set Error:', err);
      memoryHistory.set(userId, history);
    }

    return response;
  } catch (error) {
    console.error('Gemini Error:', error.message);

    if (error.message.includes('API key')) {
      return "⚠️ Invalid Gemini API key. Please check your configuration.";
    }
    if (error.message.includes('quota')) {
      return "⏳ AI quota exceeded. Please try again later.";
    }

    return "🤖 I'm having trouble connecting right now. Please try again!";
  }
};

/**
 * Clear chat history for a user
 */
const clearHistory = async (userId) => {
  try {
    const historyKey = `chat_history:${userId}`;
    if (redisClient.isOpen) {
      await redisClient.del(historyKey);
    }
    memoryHistory.delete(userId);
    return true;
  } catch (error) {
    console.error('Clear History Error:', error);
    return false;
  }
};

module.exports = {
  getGeminiResponse,
  clearHistory
};
