import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    subTitle: {
        type: String
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    isPublished: {
        type: Boolean,
        required: true,
        default: false
    },

    // ============================================
    // USER WHO CREATED THE BLOG
    // ============================================

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    authorName: {
        type: String,
        default: ""
    },

    authorEmail: {
        type: String,
        default: ""
    },

    // ============================================
    // SEO FIELDS
    // ============================================

    metaTitle: {
        type: String,
        default: ""
    },

    metaDescription: {
        type: String,
        default: ""
    },

    slug: {
        type: String,
        default: ""
    },

    focusKeyword: {
        type: String,
        default: ""
    },

    seoKeywords: {
        type: [String],
        default: []
    },

    seoTips: {
        type: [String],
        default: []
    }

}, {
    timestamps: true
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;