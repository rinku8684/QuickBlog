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

// -----------------------------------------------------
// REGISTER USER
// POST /api/user/register
// -----------------------------------------------------

userRouter.post(
    "/register",
    registerUser
);


// -----------------------------------------------------
// LOGIN USER
// POST /api/user/login
// -----------------------------------------------------

userRouter.post(
    "/login",
    loginUser
);


// -----------------------------------------------------
// GET LOGGED-IN USER PROFILE
// GET /api/user/profile
// -----------------------------------------------------

userRouter.get(
    "/profile",
    userAuth,
    getUserProfile
);


// =====================================================
// USER BLOG ROUTES
// =====================================================

// -----------------------------------------------------
// ADD BLOG BY LOGGED-IN USER
// POST /api/user/blog/add
//
// IMPORTANT:
// User blog is submitted for admin approval.
// It will NOT be published directly.
// -----------------------------------------------------

userRouter.post(
    "/blog/add",
    userAuth,
    upload.single("image"),
    addUserBlog
);


// -----------------------------------------------------
// GET LOGGED-IN USER'S BLOGS
// GET /api/user/blog/my
// -----------------------------------------------------

userRouter.get(
    "/blog/my",
    userAuth,
    getMyBlogs
);


export default userRouter;