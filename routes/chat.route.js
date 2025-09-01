import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createChat,
  getChat,
  getMessage,
  createUserChat,
  createUserChatLink,
  joinChatByLink,
  getAllUserChat,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Create a personal chat (AI bot chat)
router.post("/create", authMiddleware, createChat);

// Get all chats of logged-in user
router.get("/:id", authMiddleware, getChat);

// Get messages of a specific chat
router.get("/:id/messages", authMiddleware, getMessage);

// Create a group/user chat
router.post("/user/create", authMiddleware, createUserChat);

// Generate invite link for a group chat
router.post("/user/:chatId/invite", authMiddleware, createUserChatLink);

// Join group chat via invite link token
router.post("/join/:token", authMiddleware, joinChatByLink);
// get all user chat
router.get("/user/:id", authMiddleware, getAllUserChat);

export default router;
