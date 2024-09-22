const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Room', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    read: { type: Boolean, default: false },
});

const Chat = mongoose.model('Chat', messageSchema);
module.exports = Chat

