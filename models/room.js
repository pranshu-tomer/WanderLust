const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    participants: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        }
    ],
    roomName: { 
        type: String, 
        required: true 
    },
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room
