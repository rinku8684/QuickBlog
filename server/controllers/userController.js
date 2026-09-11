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

        // ---------------------------------------------
        // REQUIRED FIELDS
        // ---------------------------------------------

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

        // ---------------------------------------------
        // USERNAME VALIDATION
        // ---------------------------------------------

        const cleanUsername = username.trim();

        if (cleanUsername.length < 3) {
            return res.json({
                success: false,
                message:
                    "Username must contain at least 3 characters"
            });
        }

        // ---------------------------------------------
        // EMAIL VALIDATION
        // ---------------------------------------------

        const cleanEmail = email.trim().toLowerCase();

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.json({
                success: false,
                message:
                    "Please enter a valid email address"
            });
        }

        // ---------------------------------------------
        // PHONE VALIDATION
        // ---------------------------------------------

        const cleanPhone =
            phone.replace(/\s+/g, "").trim();

        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(cleanPhone)) {
            return res.json({
                success: false,
                message:
                    "Please enter a valid 10-digit Indian phone number"
            });
        }

        // ---------------------------------------------
        // PASSWORD VALIDATION
        // ---------------------------------------------

        if (password.length < 6) {
            return res.json({
                success: false,
                message:
                    "Password must contain at least 6 characters"
            });
        }

        // ---------------------------------------------
        // CONFIRM PASSWORD
        // ---------------------------------------------

        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // ---------------------------------------------
        // CHECK DATABASE
        // ---------------------------------------------

        if (mongoose.connection.readyState !== 1) {
            return res.json({
                success: false,
                message: "Database is not connected"
            });
        }

        // ---------------------------------------------
        // CHECK EXISTING USER
        // ---------------------------------------------

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
                    message: "Username already exists"
                });
            }

            if (existingUser.email === cleanEmail) {
                return res.json({
                    success: false,
                    message: "Email already registered"
                });
            }

            if (existingUser.phone === cleanPhone) {
                return res.json({
                    success: false,
                    message: "Phone number already registered"
                });
            }
        }

        // ---------------------------------------------
        // HASH PASSWORD
        // ---------------------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // ---------------------------------------------
        // CREATE USER
        // ---------------------------------------------

        const user =
            await User.create({
                username: cleanUsername,
                email: cleanEmail,
                phone: cleanPhone,
                password: hashedPassword
            });

        // ---------------------------------------------
        // CREATE TOKEN
        // ---------------------------------------------

        const token =
            createUserToken(user._id);

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        res.json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {

        console.error(
            "User Registration Error:",
            error
        );

        res.json({
            success: false,
            message: error.message
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

        // ---------------------------------------------
        // REQUIRED FIELDS
        // ---------------------------------------------

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

        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

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

        // ---------------------------------------------
        // CHECK PASSWORD
        // ---------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.json({
                success: false,
                message: "Invalid password"
            });
        }

        // ---------------------------------------------
        // CREATE TOKEN
        // ---------------------------------------------

        const token =
            createUserToken(user._id);

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {

        console.error(
            "User Login Error:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};

// =====================================================
// GET LOGGED-IN USER
// =====================================================

export const getUserProfile = async (req, res) => {
    try {

        const user =
            await User.findById(
                req.userId
            ).select("-password");

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
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
            message: error.message
        });
    }
};

// =====================================================
// ADD BLOG BY USER
// =====================================================

export const addUserBlog = async (req, res) => {

    let imageFilePath = null;

    try {

        // ---------------------------------------------
        // GET LOGGED-IN USER
        // ---------------------------------------------

        const user =
            await User.findById(
                req.userId
            ).select("-password");

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // ---------------------------------------------
        // GET BLOG DATA
        // ---------------------------------------------

        const blogData =
            JSON.parse(
                req.body.blog || "{}"
            );

        const {
            title,
            subTitle,
            description,
            category
        } = blogData;

        // ---------------------------------------------
        // GET IMAGE
        // ---------------------------------------------

        const imageFile = req.file;

        if (imageFile) {
            imageFilePath = imageFile.path;
        }

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            !title?.trim() ||
            !description?.trim() ||
            !category?.trim() ||
            !imageFile
        ) {
            return res.json({
                success: false,
                message:
                    "Title, content, category and thumbnail are required"
            });
        }

        // ---------------------------------------------
        // READ IMAGE FILE
        // ---------------------------------------------

        const fileBuffer =
            fs.readFileSync(
                imageFile.path
            );

        // ---------------------------------------------
        // UPLOAD IMAGE TO IMAGEKIT
        // ---------------------------------------------

        const response =
            await imagekit.upload({
                file: fileBuffer,
                fileName:
                    imageFile.originalname,
                folder: "/blogs"
            });

        // ---------------------------------------------
        // OPTIMIZE IMAGE
        // ---------------------------------------------

        const optimizedImageUrl =
            imagekit.url({
                path: response.filePath,

                transformation: [
                    {
                        quality: "auto"
                    },
                    {
                        format: "webp"
                    },
                    {
                        width: "1280"
                    }
                ]
            });

        // ---------------------------------------------
        // CREATE BLOG
        // ---------------------------------------------

        const blog =
            await Blog.create({

                title:
                    title.trim(),

                subTitle:
                    subTitle?.trim() || "",

                description:
                    description.trim(),

                category:
                    category.trim(),

                image:
                    optimizedImageUrl,

                // IMPORTANT:
                // User blogs require admin approval
                isPublished:
                    false,

                // USER INFORMATION
                author:
                    user._id,

                authorName:
                    user.username,

                authorEmail:
                    user.email
            });

        // ---------------------------------------------
        // SUCCESS RESPONSE
        // ---------------------------------------------

        res.json({
            success: true,

            message:
                "Blog submitted successfully. Waiting for admin approval.",

            blog
        });

    } catch (error) {

        console.error(
            "Add User Blog Error:",
            error
        );

        res.json({
            success: false,
            message:
                error.message
        });

    } finally {

        // ---------------------------------------------
        // DELETE TEMPORARY IMAGE
        // ---------------------------------------------

        if (
            imageFilePath &&
            fs.existsSync(imageFilePath)
        ) {
            try {
                fs.unlinkSync(
                    imageFilePath
                );
            } catch (_) {
                // Ignore file deletion error
            }
        }
    }
};