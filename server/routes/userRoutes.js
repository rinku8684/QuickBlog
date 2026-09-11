import express from "express";

import {
    registerUser,
    loginUser,
    getUserProfile,
    addUserBlog,
    getMyBlogs
} from "../controllers/userController.js";

import userAuth from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

// =====================================================
// USER AUTH ROUTES
// =====================================================

// REGISTER USER
userRouter.post(
    "/register",
    registerUser
);

// LOGIN USER
userRouter.post(
    "/login",
    loginUser
);

// GET LOGGED-IN USER PROFILE
userRouter.get(
    "/profile",
    userAuth,
    getUserProfile
);


// =====================================================
// USER BLOG ROUTES
// =====================================================

// ADD BLOG BY LOGGED-IN USER
userRouter.post(
    "/blog/add",
    userAuth,
    upload.single("image"),
    addUserBlog
);

// GET ONLY LOGGED-IN USER'S BLOGS
userRouter.get(
    "/blog/my",
    userAuth,
    getMyBlogs
);


export default userRouter;