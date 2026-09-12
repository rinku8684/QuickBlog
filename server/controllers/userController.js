import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import imagekit from "../configs/imagekit.js";

import User from "../models/user.js";
import Blog from "../models/Blog.js";


// =====================================================
// CREATE USER TOKEN
// =====================================================

const createUserToken = (userId) => {

    return jwt.sign(
        {
            userId,
            type: "user"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

};


// =====================================================
// USER REGISTER
// =====================================================

export const registerUser = async (req, res) => {

    try {

        const {
            username,
            email,
            phone,
            password,
            confirmPassword
        } = req.body;


        // REQUIRED FIELDS
        if (
            !username?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !password ||
            !confirmPassword
        ) {

            return res.json({
                success: false,
                message: "All fields are required"
            });

        }


        // USERNAME
        const cleanUsername = username.trim();

        if (cleanUsername.length < 3) {

            return res.json({
                success: false,
                message:
                    "Username must contain at least 3 characters"
            });

        }


        // EMAIL
        const cleanEmail =
            email.trim().toLowerCase();

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {

            return res.json({
                success: false,
                message:
                    "Please enter a valid email address"
            });

        }


        // PHONE
        const cleanPhone =
            phone.replace(/\s+/g, "").trim();

        const phoneRegex =
            /^[6-9]\d{9}$/;

        if (!phoneRegex.test(cleanPhone)) {

            return res.json({
                success: false,
                message:
                    "Please enter a valid 10-digit Indian phone number"
            });

        }


        // PASSWORD
        if (password.length < 6) {

            return res.json({
                success: false,
                message:
                    "Password must contain at least 6 characters"
            });

        }


        // CONFIRM PASSWORD
        if (password !== confirmPassword) {

            return res.json({
                success: false,
                message:
                    "Passwords do not match"
            });

        }


        // DATABASE CHECK
        if (mongoose.connection.readyState !== 1) {

            return res.json({
                success: false,
                message:
                    "Database is not connected"
            });

        }


        // EXISTING USER
        const existingUser =
            await User.findOne({
                $or: [
                    {
                        username: cleanUsername
                    },
                    {
                        email: cleanEmail
                    },
                    {
                        phone: cleanPhone
                    }
                ]
            });


        if (existingUser) {

            if (
                existingUser.username.toLowerCase() ===
                cleanUsername.toLowerCase()
            ) {

                return res.json({
                    success: false,
                    message:
                        "Username already exists"
                });

            }


            if (
                existingUser.email === cleanEmail
            ) {

                return res.json({
                    success: false,
                    message:
                        "Email already registered"
                });

            }


            if (
                existingUser.phone === cleanPhone
            ) {

                return res.json({
                    success: false,
                    message:
                        "Phone number already registered"
                });

            }

        }


        // HASH PASSWORD
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // CREATE USER
        const user =
            await User.create({

                username:
                    cleanUsername,

                email:
                    cleanEmail,

                phone:
                    cleanPhone,

                password:
                    hashedPassword

            });


        // TOKEN
        const token =
            createUserToken(user._id);


        // RESPONSE
        res.json({

            success: true,

            message:
                "Registration successful",

            token,

            user: {

                id:
                    user._id,

                username:
                    user.username,

                email:
                    user.email,

                phone:
                    user.phone

            }

        });


    } catch (error) {

        console.error(
            "User Registration Error:",
            error
        );

        res.json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// USER LOGIN
// =====================================================

export const loginUser = async (req, res) => {

    try {

        const {
            identifier,
            password
        } = req.body;


        if (
            !identifier?.trim() ||
            !password
        ) {

            return res.json({

                success: false,

                message:
                    "Email, username or phone number and password are required"

            });

        }


        const value =
            identifier.trim();


        // FIND USER
        const user =
            await User.findOne({

                $or: [

                    {
                        email:
                            value.toLowerCase()
                    },

                    {
                        username:
                            value
                    },

                    {
                        phone:
                            value.replace(
                                /\s+/g,
                                ""
                            )
                    }

                ]

            });


        if (!user) {

            return res.json({

                success: false,

                message:
                    "Invalid email, username or phone number"

            });

        }


        // PASSWORD
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.json({

                success: false,

                message:
                    "Invalid password"

            });

        }


        // TOKEN
        const token =
            createUserToken(user._id);


        // RESPONSE
        res.json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                id:
                    user._id,

                username:
                    user.username,

                email:
                    user.email,

                phone:
                    user.phone

            }

        });


    } catch (error) {

        console.error(
            "User Login Error:",
            error
        );

        res.json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// GET USER PROFILE
// =====================================================

export const getUserProfile = async (req, res) => {

    try {

        if (!req.userId) {

            return res.json({

                success: false,

                message:
                    "User authentication required"

            });

        }


        const user =
            await User.findById(
                req.userId
            ).select("-password");


        if (!user) {

            return res.json({

                success: false,

                message:
                    "User not found"

            });

        }


        res.json({

            success: true,

            user

        });


    } catch (error) {

        console.error(
            "Get User Profile Error:",
            error
        );

        res.json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// ADD BLOG BY USER
// =====================================================

export const addUserBlog = async (req, res) => {

    let imageFilePath = null;

    try {

        // =================================================
        // CHECK LOGIN
        // =================================================

        if (!req.userId) {

            return res.json({

                success: false,

                message:
                    "User authentication required"

            });

        }


        // =================================================
        // GET USER
        // =================================================

        const user =
            await User.findById(
                req.userId
            ).select("-password");


        if (!user) {

            return res.json({

                success: false,

                message:
                    "User not found"

            });

        }


        // =================================================
        // CHECK BLOG DATA
        // =================================================

        let blogData = {};

        try {

            blogData =
                JSON.parse(
                    req.body.blog || "{}"
                );

        } catch (parseError) {

            console.error(
                "Blog JSON Parse Error:",
                parseError
            );

            return res.json({

                success: false,

                message:
                    "Invalid blog data"

            });

        }


        // =================================================
        // GET BLOG FIELDS
        // =================================================

        const title =
            blogData.title?.trim() || "";


        const subTitle =
            blogData.subTitle?.trim() || "";


        /*
         * IMPORTANT FIX
         *
         * Frontend sends:
         *
         * content
         *
         * Older code expected:
         *
         * description
         *
         * So we support BOTH.
         */

        const blogContent =
            (
                blogData.content ||
                blogData.description ||
                ""
            ).trim();


        const category =
            blogData.category?.trim() || "";


        const metaTitle =
            blogData.metaTitle?.trim() || "";


        const metaDescription =
            blogData.metaDescription?.trim() || "";


        const slug =
            blogData.slug?.trim() || "";


        const focusKeyword =
            blogData.focusKeyword?.trim() || "";


        const seoKeywords =
            Array.isArray(
                blogData.seoKeywords
            )
                ? blogData.seoKeywords
                : [];


        const seoTips =
            Array.isArray(
                blogData.seoTips
            )
                ? blogData.seoTips
                : [];


        // =================================================
        // GET IMAGE
        // =================================================

        const imageFile =
            req.file;


        if (imageFile) {

            imageFilePath =
                imageFile.path;

        }


        // =================================================
        // VALIDATION
        // =================================================

        if (!title) {

            return res.json({

                success: false,

                message:
                    "Title is required"

            });

        }


        if (!blogContent) {

            return res.json({

                success: false,

                message:
                    "Blog content is required"

            });

        }


        if (!category || category === "All") {

            return res.json({

                success: false,

                message:
                    "Please select a valid blog category"

            });

        }


        if (!imageFile) {

            return res.json({

                success: false,

                message:
                    "Please upload a thumbnail"

            });

        }


        // =================================================
        // CHECK IMAGE FILE
        // =================================================

        if (
            !imageFile.path ||
            !fs.existsSync(imageFile.path)
        ) {

            return res.json({

                success: false,

                message:
                    "Thumbnail file could not be processed"

            });

        }


        // =================================================
        // READ IMAGE
        // =================================================

        const fileBuffer =
            fs.readFileSync(
                imageFile.path
            );


        // =================================================
        // UPLOAD IMAGE TO IMAGEKIT
        // =================================================

        const response =
            await imagekit.upload({

                file:
                    fileBuffer,

                fileName:
                    imageFile.originalname,

                folder:
                    "/blogs"

            });


        // =================================================
        // OPTIMIZE IMAGE
        // =================================================

        const optimizedImageUrl =
            imagekit.url({

                path:
                    response.filePath,

                transformation: [

                    {
                        quality:
                            "auto"
                    },

                    {
                        format:
                            "webp"
                    },

                    {
                        width:
                            "1280"
                    }

                ]

            });


        // =================================================
        // CREATE BLOG
        // =================================================

        const blog =
            await Blog.create({

                title:
                    title,

                subTitle:
                    subTitle,

                description:
                    blogContent,

                category:
                    category,

                image:
                    optimizedImageUrl,


                // =================================================
                // USER BLOG STARTS AS PENDING
                // =================================================

                isPublished:
                    false,


                // =================================================
                // USER INFORMATION
                // =================================================

                author:
                    user._id,

                authorName:
                    user.username,

                authorEmail:
                    user.email,


                // =================================================
                // SEO INFORMATION
                // =================================================

                metaTitle:
                    metaTitle,

                metaDescription:
                    metaDescription,

                slug:
                    slug,

                focusKeyword:
                    focusKeyword,

                seoKeywords:
                    seoKeywords,

                seoTips:
                    seoTips

            });


        // =================================================
        // SUCCESS
        // =================================================

        return res.json({

            success: true,

            message:
                "Blog submitted successfully and is waiting for admin approval.",

            blog

        });


    } catch (error) {

        console.error(
            "Add User Blog Error:",
            error
        );


        return res.json({

            success: false,

            message:
                error.message ||
                "Unable to submit blog"

        });


    } finally {

        // =================================================
        // DELETE TEMPORARY IMAGE
        // =================================================

        if (
            imageFilePath &&
            fs.existsSync(imageFilePath)
        ) {

            try {

                fs.unlinkSync(
                    imageFilePath
                );

            } catch (deleteError) {

                console.error(
                    "Temporary image delete error:",
                    deleteError
                );

            }

        }

    }

};


// =====================================================
// GET MY BLOGS
// =====================================================

export const getMyBlogs = async (req, res) => {

    try {

        // =================================================
        // CHECK LOGIN
        // =================================================

        if (!req.userId) {

            return res.json({

                success: false,

                message:
                    "User authentication required"

            });

        }


        // =================================================
        // GET LOGGED-IN USER BLOGS
        // =================================================

        const blogs =
            await Blog.find({

                author:
                    req.userId

            })
                .sort({

                    createdAt:
                        -1

                });


        // =================================================
        // RESPONSE
        // =================================================

        return res.json({

            success: true,

            blogs

        });


    } catch (error) {

        console.error(
            "Get My Blogs Error:",
            error
        );


        return res.json({

            success: false,

            message:
                error.message ||
                "Unable to get your blogs"

        });

    }

};