import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    circleBankAccountId: String,
    walletAddress: String,
});

const User = mongoose.model('User', userSchema);

export default User;