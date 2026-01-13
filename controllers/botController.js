const messageService = require('../services/messageService');

// Simple pattern matching for now
const getBotResponse = (text) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
    return "👋 Hello! I'm LuxBot. How can I help you today?";
  }
  if (lowerText.includes('help')) {
    return 'I can help you with: \n- General queries \n- Navigation help \n- Just chatting!';
  }
  if (lowerText.includes('who are you')) {
    return 'I am LuxBot, your AI assistant for this chat application.';
  }
  if (lowerText.includes('bye')) {
    return 'Goodbye! Have a great day! 👋';
  }

  return "I'm still learning! I didn't quite catch that. Try saying 'Hello' or 'Help'.";
};

// Handle incoming message to bot
const handleBotMessage = async (io, senderId, text, botUser) => {
  try {
    // 1. Simulate "Typing" delay
    setTimeout(async () => {
      io.to(senderId).emit('typing.start', {
        userId: botUser._id,
        name: botUser.name,
        roomId: senderId // DM room
      });

      // 2. Generate Response after delay
      setTimeout(async () => {
        const responseText = getBotResponse(text);

        // Stop typing
        io.to(senderId).emit('typing.stop', {
          userId: botUser._id,
          roomId: senderId
        });

        // 3. Send Message
        const message = await messageService.sendMessage(
          botUser._id,
          senderId,
          responseText,
          false
        );

        // Emit to user
        io.to(senderId).emit('message.receive', message);
      }, 1500); // 1.5s typing duration
    }, 500); // 0.5s initial delay
  } catch (error) {
    console.error('Bot Error:', error);
  }
};

module.exports = { handleBotMessage };
