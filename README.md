# 🗨️ TalkVerse Backend

TalkVerse is a real-time chat application backend powered by **Node.js, Express, MongoDB, and Socket.IO**.  
It provides secure authentication, chat management, AI-powered responses, and persistent messaging.

---

## 📂 Project Structure

├── .gitignore
├── README.md
├── app.js # Express app setup
├── server.js # Server entry point
│
├── controllers/ # Route handlers (business logic)
│ ├── chat.controller.js
│ └── user.controller.js
│
├── db/
│ └── db.js # MongoDB connection setup
│
├── middleware/ # Custom middlewares
│ ├── auth.middleware.js # Authentication check via JWT/cookies
│ └── errorHandler.js # Centralized error handler
│
├── models/ # Mongoose models
│ ├── chat.model.js
│ ├── message.model.js
│ ├── user.model.js
│ ├── userChat.model.js
│ └── userMessage.model.js
│
├── routes/ # API routes
│ ├── chat.route.js
│ └── user.route.js
│
├── socket/
│ └── socket.service.js # Socket.IO real-time event handling
│
└── utils/ # Helper utilities
├── ApiError.js # Custom error class
├── ApiResponse.js # Unified API response format
├── ai.service.js # AI response integration
├── asyncHandler.js # Try/catch wrapper for async routes
└── vector.service.js # Vector DB or embeddings service

markdown
Copy code

---

## ⚙️ Features

- 🔑 **Authentication**
  - Login, Register, Logout with JWT + HttpOnly cookies
  - Password hashing with bcrypt
- 👤 **User Management**
  - Profile info, user lookups
- 💬 **Chat System**
  - One-to-one and group chat models
  - Messages linked to users and chats
- ⚡ **Real-time Messaging**
  - Socket.IO for instant chat updates
- 🤖 **AI Integration**
  - `ai.service.js` provides smart AI responses
- 🛡️ **Security**
  - HttpOnly cookies
  - CORS with credentials
  - Centralized error handling

---

## 🚀 Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/your-username/talkverse-backend.git
cd talkverse-backend