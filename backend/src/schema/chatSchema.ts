import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    groupId: String,
    sender: String,
    recipient: String,
    text: String
});

const Chat = mongoose.model('Chat', ChatSchema);

export default Chat;