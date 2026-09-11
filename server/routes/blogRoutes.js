import express from "express";

import {
    addBlog,
    addComment,
    deleteBlogById,
    generateContent,
    analyzeContent,
    improveContent,
    generateSEO,
    thumbnailIdea,
    quickAction,
    counterPerspective,
    askAboutBlog,
    changeTone,
    generateIdeas,
    updateBlog,
    getAllBlogs,
    getBlogById,
    getBlogComments,
    togglePublish,
    getPendingComments,
    approveComment,
    deleteComment
} from "../controllers/blogController.js";

import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";
import aiAuth from "../middleware/aiAuth.js";

const blogRouter = express.Router();


// =====================================================
// ADMIN BLOG MANAGEMENT
// =====================================================

// Add Blog
blogRouter.post(
    "/add",
    upload.single("image"),
    auth,
    addBlog
);


// Get all published blogs
blogRouter.get(
    "/all",
    getAllBlogs
);


// Get single blog
blogRouter.get(
    "/:blogId",
    getBlogById
);


// Delete blog
blogRouter.post(
    "/delete",
    auth,
    deleteBlogById
);


// Publish / Unpublish blog
blogRouter.post(
    "/toggle-publish",
    auth,
    togglePublish
);


// =====================================================
// COMMENTS
// =====================================================

// Add comment
blogRouter.post(
    "/add-comment",
    addComment
);


// Get blog comments
blogRouter.post(
    "/comments",
    getBlogComments
);


// =====================================================
// ADMIN COMMENT MANAGEMENT
// =====================================================

// Get pending comments
blogRouter.get(
    "/comments/pending",
    auth,
    getPendingComments
);


// Approve comment
blogRouter.post(
    "/comments/approve",
    auth,
    approveComment
);


// Delete comment
blogRouter.post(
    "/comments/delete",
    auth,
    deleteComment
);


// =====================================================
// AI FEATURES
// ADMIN + NORMAL USER
// =====================================================

// Generate blog using Gemini AI
blogRouter.post(
    "/generate",
    aiAuth,
    generateContent
);


// Analyze blog using AI
blogRouter.post(
    "/analyze",
    aiAuth,
    analyzeContent
);


// Improve blog using AI
blogRouter.post(
    "/improve",
    aiAuth,
    improveContent
);


// =====================================================
// AI CONTENT STUDIO
// ADMIN + NORMAL USER
// =====================================================

// Generate SEO
blogRouter.post(
    "/generate-seo",
    aiAuth,
    generateSEO
);


// Thumbnail Idea
blogRouter.post(
    "/thumbnail-idea",
    aiAuth,
    thumbnailIdea
);


// Quick AI Actions
blogRouter.post(
    "/quick-action",
    aiAuth,
    quickAction
);


// Counter Perspective
blogRouter.post(
    "/counter-perspective",
    aiAuth,
    counterPerspective
);


// Ask AI
blogRouter.post(
    "/ask",
    aiAuth,
    askAboutBlog
);


// Change Blog Tone
blogRouter.post(
    "/change-tone",
    aiAuth,
    changeTone
);


// Generate Blog Ideas
blogRouter.post(
    "/generate-ideas",
    aiAuth,
    generateIdeas
);


// =====================================================
// ADMIN EDIT / UPDATE BLOG
// =====================================================

blogRouter.post(
    "/update",
    upload.single("image"),
    auth,
    updateBlog
);


export default blogRouter;