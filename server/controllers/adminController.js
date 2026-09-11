import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

const waitForDB = async (timeoutMs = 30000) => {
    const start = Date.now();
    while (mongoose.connection.readyState !== 1) {
        if (Date.now() - start > timeoutMs) {
            throw new Error(`Database not ready. Check MongoDB connection.`);
        }
        await new Promise(r => setTimeout(r, 200));
    }
};

export const adminLogin = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "invalid credentials" })
        }
        const token = jwt.sign({ email }, process.env.JWT_SECRET)
        res.json({ success: true, token })

    } catch (error) {
        res.json({ success: false, message: error.message });

    }

}
export const getAllBlogsAdmin = async(req, res) => {
    try {
        await waitForDB();
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.json({ success: true, blogs })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const getAllComments = async(req, res) => {
    try {
        await waitForDB();
        const comments = await Comment.find().populate("blog", "title").sort({ createdAt: -1 });
        res.json({ success: true, comments })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getDashboard = async(req, res) => {
    try {
        await waitForDB();
        const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments();
        const drafts = await Blog.countDocuments({ isPublished: false });
        const dashboardData = {
            blogs,
            comments,
            drafts,
            recentBlogs
        }
        res.json({ success: true, dashboardData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const deleteCommentById = async(req, res) => {
    try {
        const { id } = req.body;
        await waitForDB();
        await Comment.findByIdAndDelete(id);
        res.json({ success: true, message: "comment deleted successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const approveCommentById = async(req, res) => {
    try {
        const { id } = req.body;
        await waitForDB();
        await Comment.findByIdAndUpdate(id, { isApproved: true });
        res.json({ success: true, message: "comment approved successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}