import React, { useEffect, useRef, useState } from "react";

import { assets, blogCategories } from "../assets/assets";

import Quill from "quill";

import { useAppContext } from "../context/AppContext";

import toast from "react-hot-toast";

import { parse } from "marked";

import AIStudio from "../components/admin/AIStudio";


const AddBlog = () => {

    const {
        axios,
        userToken,
        user
    } = useAppContext();


    // ============================================
    // REFS
    // ============================================

    const editorRef = useRef(null);

    const quillRef = useRef(null);


    // ============================================
    // BLOG STATES
    // ============================================

    const [image, setImage] = useState(null);

    const [title, setTitle] = useState("");

    const [subtitle, setSubtitle] = useState("");

    const [category, setCategory] = useState("All");


    // ============================================
    // LOADING STATES
    // ============================================

    const [isAdding, setIsAdding] = useState(false);

    const [loading, setLoading] = useState(false);

    const [analyzing, setAnalyzing] = useState(false);


    // ============================================
    // AI STATES
    // ============================================

    const [analysis, setAnalysis] = useState(null);

    const [seoData, setSeoData] = useState(null);


    // ============================================
    // INITIALIZE QUILL
    // ============================================

    useEffect(() => {

        if (
            !quillRef.current &&
            editorRef.current
        ) {

            quillRef.current = new Quill(
                editorRef.current,
                {
                    theme: "snow",

                    placeholder:
                        "Write your blog content here...",

                    modules: {

                        toolbar: [

                            [
                                {
                                    header: [
                                        1,
                                        2,
                                        3,
                                        false
                                    ]
                                }
                            ],

                            [
                                "bold",
                                "italic",
                                "underline",
                                "strike"
                            ],

                            [
                                {
                                    list: "ordered"
                                },
                                {
                                    list: "bullet"
                                }
                            ],

                            [
                                "link",
                                "blockquote"
                            ],

                            [
                                {
                                    align: []
                                }
                            ],

                            [
                                {
                                    color: []
                                },
                                {
                                    background: []
                                }
                            ],

                            [
                                "clean"
                            ]

                        ]
                    }
                }
            );

        }

    }, []);


    // ============================================
    // CHECK EMPTY EDITOR
    // ============================================

    const isEditorEmpty = () => {

        if (!quillRef.current) {
            return true;
        }

        const text =
            quillRef.current
                .getText()
                ?.trim() || "";

        return text.length === 0;
    };


    // ============================================
    // GENERATE BLOG WITH AI
    // ============================================

    const generateContent = async () => {

        if (loading) {
            return;
        }

        if (!title.trim()) {

            toast.error(
                "Please enter a blog title"
            );

            return;
        }


        try {

            setLoading(true);


            const { data } =
                await axios.post(
                    "/api/blog/generate",

                    {
                        prompt: title
                    },

                    {
                        headers: {
                            Authorization: userToken
                        }
                    }
                );


            if (data.success) {

                const html =
                    parse(data.content || "");

                if (quillRef.current) {

                    quillRef.current.clipboard
                        .dangerouslyPasteHTML(
                            html
                        );

                }

                toast.success(
                    "Blog content generated"
                );

            } else {

                toast.error(
                    data.message ||
                    "Unable to generate blog"
                );

            }

        } catch (error) {

            console.error(
                "Generate Blog Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Unable to generate blog"
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================
    // IMPROVE BLOG WITH AI
    // ============================================

    const improveBlog = async () => {

        if (loading) {
            return;
        }


        const currentContent =
            quillRef.current?.root?.innerHTML || "";


        if (
            !currentContent ||
            currentContent === "<p><br></p>"
        ) {

            toast.error(
                "Please write or generate blog content first"
            );

            return;
        }


        try {

            setLoading(true);


            const { data } =
                await axios.post(
                    "/api/blog/improve",

                    {
                        title,

                        subTitle:
                            subtitle,

                        description:
                            currentContent,

                        category,

                        suggestions:
                            "Make the blog more professional, engaging and easy to read."
                    },

                    {
                        headers: {
                            Authorization: userToken
                        }
                    }
                );


            if (data.success) {

                const html =
                    parse(data.content || "");

                if (quillRef.current) {

                    quillRef.current.clipboard
                        .dangerouslyPasteHTML(
                            html
                        );

                }

                toast.success(
                    "Blog improved successfully"
                );

            } else {

                toast.error(
                    data.message ||
                    "Unable to improve blog"
                );

            }

        } catch (error) {

            console.error(
                "Improve Blog Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Unable to improve blog"
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================
    // ANALYZE BLOG WITH AI
    // ============================================

    const analyzeBlog = async () => {

        if (analyzing) {
            return;
        }


        if (!title.trim()) {

            toast.error(
                "Please enter a blog title"
            );

            return;
        }


        const blogContent =
            quillRef.current?.root?.innerHTML || "";


        if (
            !blogContent ||
            blogContent === "<p><br></p>"
        ) {

            toast.error(
                "Please write or generate blog content first"
            );

            return;
        }


        try {

            setAnalyzing(true);

            setAnalysis(null);


            const { data } =
                await axios.post(
                    "/api/blog/analyze",

                    {
                        title,

                        subTitle:
                            subtitle,

                        description:
                            blogContent,

                        category
                    },

                    {
                        headers: {
                            Authorization: userToken
                        }
                    }
                );


            if (data.success) {

                setAnalysis(
                    data.analysis
                );

                toast.success(
                    "Blog analysis completed"
                );

            } else {

                toast.error(
                    data.message ||
                    "Unable to analyze blog"
                );

            }

        } catch (error) {

            console.error(
                "Analyze Blog Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Unable to analyze blog"
            );

        } finally {

            setAnalyzing(false);

        }

    };


    // ============================================
    // SUBMIT BLOG FOR ADMIN APPROVAL
    // ============================================

    const onSubmitHandler = async (e) => {

        e.preventDefault();


        if (isAdding) {
            return;
        }


        // ----------------------------------------
        // IMAGE
        // ----------------------------------------

        if (!image) {

            toast.error(
                "Please upload a thumbnail"
            );

            return;
        }


        // ----------------------------------------
        // TITLE
        // ----------------------------------------

        if (!title.trim()) {

            toast.error(
                "Please enter a blog title"
            );

            return;
        }


        // ----------------------------------------
        // CONTENT
        // ----------------------------------------

        if (isEditorEmpty()) {

            toast.error(
                "Please write your blog content first"
            );

            return;
        }


        try {

            setIsAdding(true);


            // ----------------------------------------
            // GET CONTENT
            // ----------------------------------------

            const blogContent =
                quillRef.current
                    .root
                    .innerHTML;


            // ----------------------------------------
            // BLOG DATA
            // ----------------------------------------

            const blog = {

                title:
                    title.trim(),

                subTitle:
                    subtitle.trim(),

                description:
                    blogContent,

                category,


                // ====================================
                // IMPORTANT
                // USER BLOG WILL NOT BE PUBLISHED
                // DIRECTLY.
                //
                // FALSE = PENDING ADMIN APPROVAL
                // ====================================

                isPublished: false,


                // ----------------------------------------
                // SAVE SEO DATA IF GENERATED
                // ----------------------------------------

                ...(seoData || {})

            };


            // ----------------------------------------
            // FORM DATA
            // ----------------------------------------

            const formData =
                new FormData();


            formData.append(
                "blog",
                JSON.stringify(blog)
            );


            formData.append(
                "image",
                image
            );


            // ----------------------------------------
            // SEND BLOG TO BACKEND
            // ----------------------------------------

            const { data } =
                await axios.post(
                    "/api/user/blog/add",

                    formData,

                    {
                        headers: {
                            Authorization:
                                userToken
                        }
                    }
                );


            // ----------------------------------------
            // RESPONSE
            // ----------------------------------------

            if (!data.success) {

                toast.error(
                    data.message ||
                    "Unable to submit blog"
                );

                return;
            }


            // ----------------------------------------
            // SUCCESS
            // ----------------------------------------

            toast.success(
                data.message ||
                "Blog submitted successfully. Waiting for admin approval."
            );


            // ----------------------------------------
            // RESET FORM
            // ----------------------------------------

            setImage(null);

            setTitle("");

            setSubtitle("");

            setCategory("All");

            setAnalysis(null);

            setSeoData(null);


            // ----------------------------------------
            // CLEAR QUILL
            // ----------------------------------------

            if (quillRef.current) {

                quillRef.current.setContents([]);

            }


            // ----------------------------------------
            // CLEAR FILE INPUT
            // ----------------------------------------

            const fileInput =
                document.getElementById(
                    "user-blog-image"
                );


            if (fileInput) {

                fileInput.value = "";

            }

        } catch (error) {

            console.error(
                "User Submit Blog Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Unable to submit blog"
            );

        } finally {

            setIsAdding(false);

        }

    };


    // ============================================
    // IMAGE PREVIEW
    // ============================================

    const imagePreview =
        image
            ? URL.createObjectURL(image)
            : assets.upload_area;


    // ============================================
    // LOGIN CHECK
    // ============================================

    if (!userToken || !user) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-gray-50">

                <div className="text-center">

                    <h2 className="text-2xl font-semibold text-gray-800">
                        Please Login First
                    </h2>

                    <p className="text-gray-500 mt-2">
                        You need to login before creating a blog.
                    </p>

                </div>

            </div>

        );

    }


    // ============================================
    // UI
    // ============================================

    return (

        <div className="min-h-screen bg-blue-50/50 py-10 px-4">

            <form
                onSubmit={onSubmitHandler}
                className="bg-white w-full max-w-5xl mx-auto p-5 md:p-10 shadow rounded"
            >

                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="mb-8">

                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        Create Your Blog
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        Share your ideas with the QuickBlog community.
                    </p>

                </div>


                {/* =====================================
                    AUTHOR
                ===================================== */}

                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">

                    <p className="text-sm text-gray-500">
                        Author
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                        {user.username}
                    </p>

                </div>


                {/* =====================================
                    IMAGE
                ===================================== */}

                <p className="text-gray-700">
                    Upload Thumbnail
                </p>


                <label htmlFor="user-blog-image">

                    <img
                        src={imagePreview}
                        alt="Blog thumbnail"
                        className="mt-2 h-28 w-48 rounded cursor-pointer object-cover border"
                    />


                    <input
                        id="user-blog-image"
                        type="file"
                        accept="image/*"
                        hidden
                        required={!image}

                        onChange={(e) => {

                            const file =
                                e.target.files?.[0];

                            if (file) {

                                setImage(file);

                            }

                        }}
                    />

                </label>


                {/* =====================================
                    TITLE
                ===================================== */}

                <p className="mt-6 text-gray-700">
                    Blog Title
                </p>


                <input
                    type="text"
                    placeholder="Enter your blog title"
                    value={title}

                    onChange={(e) =>
                        setTitle(
                            e.target.value
                        )
                    }

                    className="w-full max-w-3xl mt-2 p-3 border border-gray-300 outline-none rounded"

                    required
                />


                {/* =====================================
                    SUBTITLE
                ===================================== */}

                <p className="mt-5 text-gray-700">
                    Sub Title
                </p>


                <input
                    type="text"
                    placeholder="Enter a short subtitle"
                    value={subtitle}

                    onChange={(e) =>
                        setSubtitle(
                            e.target.value
                        )
                    }

                    className="w-full max-w-3xl mt-2 p-3 border border-gray-300 outline-none rounded"
                />


                {/* =====================================
                    CATEGORY
                ===================================== */}

                <p className="mt-5 text-gray-700">
                    Blog Category
                </p>


                <select
                    value={category}

                    onChange={(e) =>
                        setCategory(
                            e.target.value
                        )
                    }

                    className="mt-2 px-3 py-3 border border-gray-300 outline-none rounded"
                >

                    <option value="All">
                        All
                    </option>


                    {blogCategories.map(
                        (item, index) => (

                            <option
                                key={index}
                                value={item}
                            >
                                {item}
                            </option>

                        )
                    )}

                </select>


                {/* =====================================
                    AI BUTTONS
                ===================================== */}

                <div className="flex flex-wrap gap-2 mt-7">

                    <button
                        type="button"
                        onClick={generateContent}
                        disabled={
                            loading ||
                            analyzing ||
                            isAdding
                        }

                        className="px-4 py-2 rounded bg-gray-700 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
                    >

                        {loading
                            ? "Generating..."
                            : "Generate Blog with AI"}

                    </button>


                    <button
                        type="button"
                        onClick={improveBlog}
                        disabled={
                            loading ||
                            analyzing ||
                            isAdding
                        }

                        className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                    >

                        {loading
                            ? "Working..."
                            : "Improve Blog"}

                    </button>


                    <button
                        type="button"
                        onClick={analyzeBlog}
                        disabled={
                            loading ||
                            analyzing ||
                            isAdding
                        }

                        className="px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50"
                    >

                        {analyzing
                            ? "Analyzing..."
                            : "✨ Analyze My Blog"}

                    </button>

                </div>


                {/* =====================================
                    CONTENT
                ===================================== */}

                <p className="mt-6 text-gray-700">
                    Blog Content
                </p>


                <div className="max-w-4xl mt-2 pb-5">

                    <div
                        ref={editorRef}
                        className="bg-white"
                    ></div>

                </div>


                {/* =====================================
                    AI BLOG COACH
                ===================================== */}

                {analysis && (

                    <div className="mt-6 border border-purple-200 rounded-xl bg-purple-50/40 p-5">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-bold text-gray-800">
                                    🤖 AI Blog Coach
                                </h2>

                                <p className="text-xs text-gray-500 mt-1">
                                    AI quality analysis of your current blog.
                                </p>

                            </div>

                            <span className="text-xs bg-white border border-purple-200 px-3 py-1 rounded-full text-purple-600">
                                Gemini AI
                            </span>

                        </div>


                        {/* SCORE GRID */}

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">

                            {[
                                [
                                    "Quality",
                                    analysis.qualityScore
                                ],
                                [
                                    "SEO",
                                    analysis.seoScore
                                ],
                                [
                                    "Readability",
                                    analysis.readabilityScore
                                ],
                                [
                                    "Structure",
                                    analysis.structureScore
                                ],
                                [
                                    "Engagement",
                                    analysis.engagementScore
                                ]
                            ].map(
                                ([label, score]) => (

                                    <div
                                        key={label}
                                        className="bg-white border rounded-lg p-3 text-center"
                                    >

                                        <p className="text-xs text-gray-500">
                                            {label}
                                        </p>

                                        <p className="text-2xl font-bold text-purple-600 mt-1">
                                            {score}
                                        </p>

                                        <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">

                                            <div
                                                className="h-full bg-purple-500"
                                                style={{
                                                    width: `${score}%`
                                                }}
                                            ></div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>


                        {/* STRENGTHS */}

                        {analysis.strengths?.length > 0 && (

                            <div className="mt-5 bg-white border rounded-lg p-4">

                                <h3 className="font-semibold text-sm text-green-700">
                                    ✅ Strengths
                                </h3>

                                <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">

                                    {analysis.strengths.map(
                                        (item, index) => (

                                            <li key={index}>
                                                {item}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>

                        )}


                        {/* WEAKNESSES */}

                        {analysis.weaknesses?.length > 0 && (

                            <div className="mt-4 bg-white border rounded-lg p-4">

                                <h3 className="font-semibold text-sm text-red-700">
                                    ⚠️ Weaknesses
                                </h3>

                                <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">

                                    {analysis.weaknesses.map(
                                        (item, index) => (

                                            <li key={index}>
                                                {item}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>

                        )}


                        {/* SUGGESTIONS */}

                        {analysis.suggestions?.length > 0 && (

                            <div className="mt-4 bg-white border rounded-lg p-4">

                                <h3 className="font-semibold text-sm text-blue-700">
                                    💡 Suggestions
                                </h3>

                                <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">

                                    {analysis.suggestions.map(
                                        (item, index) => (

                                            <li key={index}>
                                                {item}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>

                        )}

                    </div>

                )}


                {/* =====================================
                    AI CONTENT STUDIO
                ===================================== */}

                <AIStudio
                    title={title}
                    subtitle={subtitle}
                    category={category}

                    authToken={userToken}

                    getContent={() =>
                        quillRef.current?.root?.innerHTML || ""
                    }

                    onSEOGenerated={(data) => {

                        setSeoData(data);

                    }}

                    onContentChanged={(newContent) => {

                        if (quillRef.current) {

                            quillRef.current.clipboard
                                .dangerouslyPasteHTML(
                                    newContent
                                );

                        }

                    }}
                />


                {/* =====================================
                    SUBMIT FOR APPROVAL BUTTON
                ===================================== */}

                <button
                    type="submit"
                    disabled={isAdding}

                    className="mt-7 w-56 h-11 bg-[#F25022] text-white rounded cursor-pointer text-sm disabled:opacity-60"
                >

                    {isAdding
                        ? "Submitting..."
                        : "Submit for Approval"}

                </button>

            </form>

        </div>

    );

};


export default AddBlog;