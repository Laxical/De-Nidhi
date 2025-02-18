const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userAddress: { type: String, required: true, unique: true },
  socketId: { type: String, default: "" },
  isActive: { type: Boolean, default: false }, 
});

const User = mongoose.model('User', userSchema);

export default User;