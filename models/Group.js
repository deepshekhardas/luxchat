const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a group name'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    group_pic: {
        type: String,
        default: 'group_default.jpg'
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    last_message: {
        text: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: Date
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

GroupSchema.index({ members: 1 });
GroupSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Group', GroupSchema);
