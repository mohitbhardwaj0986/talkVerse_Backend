import mongoose from "mongoose";

const userMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserChat",
    },
    content: {
      type: String,
      required: true,
    },
   
  },
  {
    timestamps: true,
  }
);

const UserMessage = mongoose.model("UserMessage", userMessageSchema);

export default UserMessage;
