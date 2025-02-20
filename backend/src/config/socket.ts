import { Server } from "socket.io";
import User from "../schema/userSchema";
import Chat from "../schema/chatSchema";

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("register", async (userAddress) => {
      try {
        const user = await User.findOneAndUpdate(
          { userAddress },
          { socketId: socket.id, isActive: true },
          { new: true, upsert: true }
        );
        console.log(`User ${userAddress} is now active with socketId: ${socket.id}`);
      } catch (error) {
        console.error("Error in user connect status update:", error);
      }
    });

    socket.on("sendMessage", async (messageData) => {
      try {
        const recipient = await User.findOne({ userAddress: messageData.recipient });

        const chat = new Chat({
          sender: messageData.sender,
          recipient: messageData.recipient,
          text: messageData.text,
        });

        const newChat = await chat.save();
        console.log("Message saved:", newChat);

        if (recipient?.isActive) {
          io.to(recipient.socketId).emit("receiveMessage", newChat);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { socketId: "", isActive: false }
        );
        console.log(`User with socketId ${socket.id} is now inactive`);
      } catch (error) {
        console.error("Error in user disconnect status update:", error);
      }
    });
  });
};