const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    last_message: {
        text: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: Date
    },
    unread_counts: {
        type: Map,
        of: Number,
        default: {}
    },
    is_archived: {
        type: Map,
        of: Boolean,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fast retrieval of user conversations
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
