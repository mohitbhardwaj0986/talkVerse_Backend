import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import UserChat from "../models/userChat.model.js";
import crypto from "crypto";
import UserMessage from "../models/userMessage.model.js";

/* -------------------- CREATE PERSONAL AI CHAT -------------------- */
const createChat = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const user = req.user;

  if (!title || title.trim().length === 0) {
    throw new ApiError(400, "Chat title is required");
  }

  if (!user || !user._id) {
    throw new ApiError(401, "Unauthorized: user not found");
  }

  const chat = await Chat.create({
    user: user._id,
    title: title.trim(),
  });

  if (!chat) {
    throw new ApiError(500, "Failed to create chat, try again later");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user: chat.user,
      },
      "Chat created successfully"
    )
  );
});

/* -------------------- GET USER'S AI CHATS -------------------- */
const getChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const chats = await Chat.find({ user: userId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, chats));
});

/* -------------------- GET MESSAGES IN CHAT -------------------- */
const getMessage = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const message = await Message.find({ chat: chatId }).limit(20);
  return res.status(200).json(new ApiResponse(200, message));
});

/* -------------------- CREATE GROUP CHAT -------------------- */
const createUserChat = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const userId = req.user._id;

  if (!title) {
    throw new ApiError(400, "Chat title is required");
  }

  const newChat = await UserChat.create({
    title: title.trim(),
    members: [userId], // ✅ array of members
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newChat, "Group chat created successfully"));
});

/* -------------------- GENERATE INVITE LINK -------------------- */
const createUserChatLink = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  // generate unique invite token
  const inviteToken = crypto.randomBytes(16).toString("hex");

  const chat = await UserChat.findByIdAndUpdate(
    chatId,
    { inviteToken },
    { new: true }
  );

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  const link = `${inviteToken}`;

  return res
    .status(200)
    .json(new ApiResponse(200, { link }, "Invite link created successfully"));
});

/* -------------------- JOIN CHAT USING LINK -------------------- */
const joinChatByLink = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const userId = req.user._id;

  const chat = await UserChat.findOne({ inviteToken: token });
  if (!chat) {
    throw new ApiError(400, "Invalid or expired invite link");
  }

  if (!chat.members.includes(userId)) {
    chat.members.push(userId);
    await chat.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Joined chat successfully"));
});
const getAllUserChat = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allUserChat = await UserChat.find({
    members: id, // ✅ will match if id exists in the array
  });

  return res.status(200).json(new ApiResponse(200, allUserChat));
});



export {
  createChat,
  getChat,
  getMessage,
  createUserChat,
  createUserChatLink,
  joinChatByLink,
  getAllUserChat,
};
