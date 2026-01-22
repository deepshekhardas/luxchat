/**
 * Sentiment Analysis Service using Hugging Face (FREE)
 * Analyzes message sentiment and returns emoji
 */

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';

// Sentiment to Emoji mapping
const sentimentEmojis = {
    positive: '😊',
    negative: '😢',
    neutral: '😐'
};

// Extended emoji mapping based on confidence
const getDetailedEmoji = (label, score) => {
    if (label === 'positive') {
        if (score > 0.9) return '🤩';
        if (score > 0.7) return '😊';
        return '🙂';
    }
    if (label === 'negative') {
        if (score > 0.9) return '😭';
        if (score > 0.7) return '😢';
        return '😕';
    }
    return '😐';
};

/**
 * Analyze sentiment of a message
 * @param {string} text - Message to analyze
 * @returns {Promise<{label: string, score: number, emoji: string}>}
 */
const analyzeSentiment = async (text) => {
    try {
        const token = process.env.HUGGINGFACE_TOKEN;

        if (!token) {
            // Fallback: Simple keyword-based sentiment
            return getKeywordSentiment(text);
        }

        const response = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: text })
        });

        if (!response.ok) {
            console.error('Hugging Face API error:', response.status);
            return getKeywordSentiment(text);
        }

        const data = await response.json();

        // API returns array of arrays
        if (Array.isArray(data) && Array.isArray(data[0])) {
            const sentiments = data[0];
            const topSentiment = sentiments.reduce((a, b) => a.score > b.score ? a : b);

            return {
                label: topSentiment.label.toLowerCase(),
                score: topSentiment.score,
                emoji: getDetailedEmoji(topSentiment.label.toLowerCase(), topSentiment.score)
            };
        }

        return getKeywordSentiment(text);
    } catch (error) {
        console.error('Sentiment Analysis Error:', error.message);
        return getKeywordSentiment(text);
    }
};

/**
 * Fallback: Keyword-based sentiment analysis
 */
const getKeywordSentiment = (text) => {
    const lower = text.toLowerCase();

    const positiveWords = ['happy', 'great', 'awesome', 'love', 'amazing', 'good', 'excellent', 'wonderful', 'thanks', 'thank', 'lol', 'haha', '😊', '😄', '❤️', '👍'];
    const negativeWords = ['sad', 'bad', 'hate', 'terrible', 'awful', 'angry', 'upset', 'sorry', 'unfortunately', 'problem', '😢', '😭', '😠', '👎'];

    const positiveCount = positiveWords.filter(word => lower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lower.includes(word)).length;

    if (positiveCount > negativeCount) {
        return { label: 'positive', score: 0.7, emoji: '😊' };
    }
    if (negativeCount > positiveCount) {
        return { label: 'negative', score: 0.7, emoji: '😢' };
    }
    return { label: 'neutral', score: 0.5, emoji: '😐' };
};

export {
    analyzeSentiment,
    sentimentEmojis,
    getDetailedEmoji
};

