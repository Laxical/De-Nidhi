import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    groupId: String,
    senderAddress: String,
    recipientAddress: String,
    message: String
});

const Chat = mongoose.model('Chat', ChatSchema);

export default Chat;