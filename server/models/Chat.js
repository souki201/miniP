// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    senderId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;