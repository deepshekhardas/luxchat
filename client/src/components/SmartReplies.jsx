import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSmartReplies } from '../services/aiService';

/**
 * SmartReplies Component - Shows AI-suggested quick replies
 */
const SmartReplies = ({ message, onSelectReply, isVisible = true }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReplies = async () => {
            if (!message || message.trim().length < 3) {
                setReplies([]);
                return;
            }

            setLoading(true);
            try {
                const data = await getSmartReplies(message);
                setReplies(data.suggestions || []);
            } catch (error) {
                console.error('Smart replies error:', error);
                setReplies([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce: Wait 500ms after last message before fetching
        const timer = setTimeout(fetchReplies, 500);
        return () => clearTimeout(timer);
    }, [message]);

    if (!isVisible || (!loading && replies.length === 0)) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2 flex-wrap p-2"
            >
                {loading ? (
                    <div className="text-xs text-gray-400 animate-pulse">
                        ✨ Generating replies...
                    </div>
                ) : (
                    replies.map((reply, index) => (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelectReply(reply)}
                            className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 
                         rounded-full border border-white/20 
                         transition-all duration-200 hover:scale-105"
                        >
                            {reply}
                        </motion.button>
                    ))
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default SmartReplies;
