const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat history storage (in production, use Redis)
const chatHistories = new Map();

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

    // Get or create chat history
    let history = chatHistories.get(userId) || [];

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

    // Update history (keep last 10 exchanges)
    history.push({ role: 'user', parts: [{ text: message }] });
    history.push({ role: 'model', parts: [{ text: response }] });
    if (history.length > 20) {
      history = history.slice(-20);
    }
    chatHistories.set(userId, history);

    return response;
  } catch (error) {
    console.error('Gemini Error:', error.message);
    
    // Fallback responses
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
const clearHistory = (userId) => {
  chatHistories.delete(userId);
  return true;
};

module.exports = {
  getGeminiResponse,
  clearHistory
};
