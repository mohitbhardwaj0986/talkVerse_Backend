import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

const register = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if ([userName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(403, "User name and email already taken");
  }

  const user = await User.create({
    userName,
    email,
    password,
  });
  const createdUser = await User.findById(user._id).select("-password");
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User register Successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  const isEmail = identifier.includes("@");
  const query = isEmail ? { email: identifier } : { userName: identifier };

  const existedUser = await User.findOne(query);

  if (!existedUser) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await existedUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const token = existedUser.generateToken();
  const loggedInUser = await User.findById(existedUser._id).select("-password");
   const options = {
    httpOnly: true,
    secure: true,
  };


  return res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, loggedInUser, "User loggedIn Successfully"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User loggedOut Successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

export { register, login, logout, getUser };
