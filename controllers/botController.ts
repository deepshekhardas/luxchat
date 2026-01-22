import messageService from '../services/messageService';
import { getGeminiResponse } from '../services/geminiService';
import { analyzeSentiment } from '../services/sentimentService';

/**
 * Get AI response from Gemini (or fallback to pattern matching)
 */
const getBotResponse = async (userId, text) => {
  try {
    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      return await getGeminiResponse(userId, text);
    }
  } catch (error) {
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
};

/**
 * Handle incoming message to bot
 */
const handleBotMessage = async (io, senderId, text, botUser) => {
  try {
    // 1. Analyze sentiment of user's message
    let sentimentEmoji = '';
    try {
      const sentiment = await analyzeSentiment(text);
      sentimentEmoji = sentiment.emoji || '';
    } catch (e) {
      console.error('Sentiment analysis skipped:', e.message);
    }

    // 2. Simulate "Typing" delay
    setTimeout(async () => {
      io.to(senderId).emit('typing.start', {
        userId: botUser._id,
        name: botUser.name,
        roomId: senderId
      });

      // 3. Generate AI Response
      setTimeout(async () => {
        const responseText = await getBotResponse(senderId, text);

        // Stop typing
        io.to(senderId).emit('typing.stop', {
          userId: botUser._id,
          roomId: senderId
        });

        // 4. Send Message
        const message = await messageService.sendMessage(
          botUser._id.toString(),
          senderId,
          responseText,
          [],
          false
        );


        // Add sentiment info to message
        message.userSentiment = sentimentEmoji;

        // Emit to user
        io.to(senderId).emit('message.receive', message);
      }, 1500); // 1.5s typing duration
    }, 500); // 0.5s initial delay
  } catch (error) {
    console.error('Bot Error:', error);
  }
};

export { handleBotMessage };

