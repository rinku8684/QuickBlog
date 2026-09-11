import express from "express";

import {
    registerUser,
    loginUser,
    getUserProfile,
    addUserBlog
} from "../controllers/userController.js";

import userAuth from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

// =====================================================
// USER AUTH ROUTES
// =====================================================

userRouter.post("/register", registerUser);

userRouter.post("/login", loginUser);

userRouter.get(
    "/profile",
    userAuth,
    getUserProfile
);

// =====================================================
// ADD BLOG BY LOGGED-IN USER
// =====================================================

userRouter.post(
    "/blog/add",
    userAuth,
    upload.single("image"),
    addUserBlog
);

export default userRouter;