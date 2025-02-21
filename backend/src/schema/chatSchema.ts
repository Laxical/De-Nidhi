import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    isGroup: { type: Boolean, default: false },
    groupId: { type: String, index: true },
    sender: { type: String, required: true, index: true },
    recipient: { type: String, required: true, index: true },
    text: { type: String, default: "" },
    isTransfer: { type: Boolean, default: false },
    isRequest: { type: Boolean, default: false },
    amount: { type: String, default: "0" },
    transactionHash: { type: String, default: null },
    status: { type: Boolean, default: false },
    isDeclined: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
