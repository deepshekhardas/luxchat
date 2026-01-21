/**
 * Smart Reply Service using Groq (FREE - 14,400 requests/day)
 * Generates quick reply suggestions for messages
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generate smart reply suggestions
 * @param {string} message - The message to reply to
 * @param {string} context - Optional conversation context
 * @returns {Promise<string[]>} Array of 3 reply suggestions
 */
const getSmartReplies = async (message, context = '') => {
    try {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            // Fallback: Template-based replies
            return getTemplateReplies(message);
        }

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: `You are a smart reply generator. Generate exactly 3 short, casual reply suggestions for the given message. 
Each reply should be 2-8 words maximum. 
Return ONLY a JSON array of 3 strings, nothing else.
Example: ["Sure!", "Let me check", "Sounds good 👍"]`
                    },
                    {
                        role: 'user',
                        content: context ? `Context: ${context}\n\nMessage to reply to: "${message}"` : `Message to reply to: "${message}"`
                    }
                ],
                temperature: 0.7,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            console.error('Groq API error:', response.status);
            return getTemplateReplies(message);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        // Parse JSON response
        try {
            const replies = JSON.parse(content);
            if (Array.isArray(replies) && replies.length >= 3) {
                return replies.slice(0, 3);
            }
        } catch (parseError) {
            // If JSON parsing fails, extract replies manually
            const matches = content.match(/"([^"]+)"/g);
            if (matches && matches.length >= 3) {
                return matches.slice(0, 3).map(m => m.replace(/"/g, ''));
            }
        }

        return getTemplateReplies(message);
    } catch (error) {
        console.error('Smart Reply Error:', error.message);
        return getTemplateReplies(message);
    }
};

/**
 * Fallback: Template-based reply suggestions
 */
const getTemplateReplies = (message) => {
    const lower = message.toLowerCase();

    // Question replies
    if (lower.includes('?') || lower.includes('kya') || lower.includes('how') || lower.includes('what')) {
        return ['Let me check', 'I\'ll get back to you', 'Good question!'];
    }

    // Greeting replies
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        return ['Hey! 👋', 'Hi there!', 'Hello!'];
    }

    // Thanks replies
    if (lower.includes('thank') || lower.includes('thanks')) {
        return ['You\'re welcome!', 'No problem!', 'Anytime! 😊'];
    }

    // Plan/meeting replies
    if (lower.includes('meet') || lower.includes('plan') || lower.includes('tomorrow')) {
        return ['Sounds good!', 'I\'m in!', 'Let me check my schedule'];
    }

    // Default replies
    return ['Got it!', 'Okay 👍', 'Sure!'];
};

module.exports = {
    getSmartReplies,
    getTemplateReplies
};
