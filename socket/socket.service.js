import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { generateResponse, generateVector } from "../utils/ai.service.js";
import { createMemory, quaryMemory } from "../utils/vector.service.js";
import UserChat from "../models/userChat.model.js";
import UserMessage from "../models/userMessage.model.js";

const setupSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // ✅ Authentication middleware
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      if (!cookies.token) return next(new Error("No token provided"));

      const decoded = jwt.verify(cookies.token, process.env.JWT_TOKEN_SECRET);
      const user = await User.findById(decoded._id);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`⚡ ${socket.user.email} connected`);

    // ✅ Join user-specific room
    socket.join(socket.user._id.toString());

    /* ================================
       📌 USER-TO-USER CHAT
    ================================= */
    socket.on("join-chat", async ({ inviteToken }) => {
       const chat = await UserChat.findOne({ inviteToken }).populate(
        "members",
        "_id userName" // 👈 populate both _id and username
      );
      
      if (!chat) return;

      socket.join(chat._id.toString()); // join socket room
      socket.emit("joined-chat", { chatId: chat._id, members: chat.members });
    });

    socket.on("send-message", async ({ chatId, content }) => {
      try {
        
        // Save message
        const newMessage = await UserMessage.create({
          user: socket.user._id,
          userChat: chatId,
          content,
        });

        // Emit to all members in that chat room
        io.to(chatId.toString()).emit("new-message", newMessage);
      } catch (err) {
        console.error("❌ Error sending message:", err.message);
      }
    });

    /* ================================
       🤖 AI CHAT
    ================================= */
    socket.on("ai-message", async (messagePayload) => {
      try {
        // 1. Generate vector + fetch chat history
        const [vectors, chatHistory] = await Promise.all([
          generateVector(messagePayload.content),
          Message.find({ chat: messagePayload.chat })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        ]);

        // 2. Query memory
        let memory = [];
        if (messagePayload.content.length > 30) {
          memory = await quaryMemory({
            quaryVector: vectors,
            limit: 3,
            metadata: { user: socket.user._id },
          });
        }

        // 3. Context
        const stm = chatHistory.reverse().map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }));

        const ltm =
          memory.length > 0
            ? [
                {
                  role: "user",
                  parts: [
                    {
                      text: `These are some previous messages from the chat. Use them to generate a response:\n\n${memory
                        .map((item) => item.metadata.text)
                        .join("\n")}`,
                    },
                  ],
                },
              ]
            : [];

        // 4. AI Response
        const response = await generateResponse([
          ...ltm,
          ...stm,
          {
            role: "user",
            parts: [{ text: messagePayload.content }],
          },
        ]);

        // Send back to user
        socket.emit("ai-response", {
          content: response,
          chat: messagePayload.chat,
        });

        // 5. Save in background
        (async () => {
          try {
            const userMessage = await Message.create({
              chat: messagePayload.chat,
              user: socket.user._id,
              content: messagePayload.content,
              role: "user",
            });

            await createMemory({
              vectors,
              messageId: userMessage._id,
              metadata: {
                chat: messagePayload.chat,
                user: socket.user._id,
                text: userMessage.content,
              },
            });

            const responseMessage = await Message.create({
              chat: messagePayload.chat,
              user: socket.user._id,
              content: response,
              role: "model",
            });

            const responseVectors = await generateVector(response);
            await createMemory({
              vectors: responseVectors,
              messageId: responseMessage._id,
              metadata: {
                chat: messagePayload.chat,
                user: socket.user._id,
                text: response,
              },
            });
          } catch (err) {
            console.error("⚠️ Background save failed:", err.message);
          }
        })();
      } catch (error) {
        console.error("❌ Error handling ai-message:", error.message);
        socket.emit("ai-error", { error: "Failed to process your request." });
      }
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      console.log(`⚡ ${socket.user.email} disconnected`);
    });
  });

  return io;
};

export { setupSocketServer };
