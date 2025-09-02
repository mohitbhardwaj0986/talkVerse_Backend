import express from "express";
import { getUser, login, logout, register } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();

router.route("/register").post( register);
router.route("/login").post(login);
router.route("/getuser").get(authMiddleware,getUser);
router.route("/logout").post(authMiddleware,logout);

export default router;
