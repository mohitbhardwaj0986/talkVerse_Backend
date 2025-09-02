import mongoose from "mongoose";

const userChatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    inviteToken: {
      type: String||null,
    },
  },
  { timestamps: true }
);

const UserChat = mongoose.model("UserChat", userChatSchema);

export default UserChat;
