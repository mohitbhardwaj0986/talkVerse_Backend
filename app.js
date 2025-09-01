import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import cors from "cors";
import erroHandler from "./middleware/errorHandler.js";
import dotenv from 'dotenv'
const app = express();
dotenv.config()
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true,
  })
);
console.log(process.env.FRONTEND_URL);

import userRouter from "./routes/user.route.js";
import chatRouter from "./routes/chat.route.js";
app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
     

app.use(erroHandler);

export default app;
