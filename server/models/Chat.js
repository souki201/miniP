// models/User.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    roomId : {type:String},
    userId: {type:mongoose.Types.ObjectId , ref:"User"},
    message : {type:String},
    timestamp: {type:Date},
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;