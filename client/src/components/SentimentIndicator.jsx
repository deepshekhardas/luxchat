import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyzeSentiment } from '../services/aiService';

/**
 * SentimentIndicator - Shows emoji based on message sentiment
 */
const SentimentIndicator = ({ message, showLabel = false }) => {
    const [sentiment, setSentiment] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const analyze = async () => {
            if (!message || message.trim().length < 5) {
                setSentiment(null);
                return;
            }

            setLoading(true);
            try {
                const data = await analyzeSentiment(message);
                setSentiment(data);
            } catch (error) {
                console.error('Sentiment error:', error);
                setSentiment(null);
            } finally {
                setLoading(false);
            }
        };

        // Debounce
        const timer = setTimeout(analyze, 300);
        return () => clearTimeout(timer);
    }, [message]);

    if (!sentiment && !loading) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1"
        >
            {loading ? (
                <span className="text-xs text-gray-400 animate-pulse">...</span>
            ) : (
                <>
                    <span className="text-lg">{sentiment?.emoji}</span>
                    {showLabel && (
                        <span className="text-xs text-gray-400 capitalize">
                            {sentiment?.label}
                        </span>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default SentimentIndicator;
