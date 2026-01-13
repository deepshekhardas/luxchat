const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Can be either a Conversation ID or a Group ID
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  text: {
    type: String,
    required: true
  },
  attachments: [
    {
      url: String,
      fileType: String,
      originalName: String
    }
  ],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  read_by: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  is_deleted: {
    type: Boolean,
    default: false
  },
  is_edited: {
    type: Boolean,
    default: false
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

// Indexes for fast history loading
MessageSchema.index({ conversation_id: 1, createdAt: -1 });
MessageSchema.index({ group_id: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
