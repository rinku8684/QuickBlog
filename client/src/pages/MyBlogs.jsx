import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBlogs = () => {

    const {
        axios,
        userToken,
        user
    } = useAppContext();

    const navigate = useNavigate();

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);


    // ============================================
    // FETCH MY BLOGS
    // ============================================

    const fetchMyBlogs = async () => {

        if (!userToken) {
            setLoading(false);
            return;
        }

        try {

            setLoading(true);

            const { data } = await axios.get(
                "/api/user/blog/my",
                {
                    headers: {
                        Authorization: userToken
                    }
                }
            );

            if (data.success) {

                setBlogs(data.blogs || []);

            } else {

                toast.error(
                    data.message ||
                    "Unable to load your blogs"
                );

            }

        } catch (error) {

            console.error(
                "Fetch My Blogs Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load your blogs"
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================
    // FETCH WHEN PAGE LOADS
    // ============================================

    useEffect(() => {

        fetchMyBlogs();

    }, [userToken]);


    // ============================================
    // NOT LOGGED IN
    // ============================================

    if (!userToken || !user) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-gray-50">

                <div className="text-center">

                    <div className="text-5xl mb-4">
                        🔐
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-800">
                        Please Login First
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Login to view your blogs.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700"
                    >
                        Login
                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="min-h-screen bg-gray-50 px-4 py-10">

            <div className="max-w-6xl mx-auto">


                {/* ============================================
                    HEADER
                ============================================ */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            My Blogs
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Blogs created by {user.username}
                        </p>

                    </div>


                    <div className="flex gap-3">

                        <button
                            onClick={() => navigate("/profile")}
                            className="border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-white"
                        >
                            ← Profile
                        </button>


                        <button
                            onClick={() => navigate("/add-blog")}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700"
                        >
                            + Create Blog
                        </button>

                    </div>

                </div>


                {/* ============================================
                    BLOG COUNT
                ============================================ */}

                {!loading && (

                    <div className="mb-6">

                        <div className="inline-flex items-center gap-2 bg-white border rounded-full px-4 py-2">

                            <span className="text-sm text-gray-500">
                                Total Blogs
                            </span>

                            <span className="font-bold text-indigo-600">
                                {blogs.length}
                            </span>

                        </div>

                    </div>

                )}


                {/* ============================================
                    LOADING
                ============================================ */}

                {loading && (

                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">

                        <div className="text-4xl">
                            ⏳
                        </div>

                        <p className="text-gray-500 mt-3">
                            Loading your blogs...
                        </p>

                    </div>

                )}


                {/* ============================================
                    NO BLOGS
                ============================================ */}

                {!loading && blogs.length === 0 && (

                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">

                        <div className="text-6xl">
                            📝
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800 mt-4">
                            You haven't created any blogs yet
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Start sharing your ideas with the QuickBlog community.
                        </p>

                        <button
                            onClick={() => navigate("/add-blog")}
                            className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700"
                        >
                            Create Your First Blog
                        </button>

                    </div>

                )}


                {/* ============================================
                    BLOG GRID
                ============================================ */}

                {!loading && blogs.length > 0 && (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {blogs.map((blog) => (

                            <div
                                key={blog._id}
                                className="bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition"
                            >

                                {/* =====================================
                                    IMAGE
                                ===================================== */}

                                {blog.image ? (

                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-52 object-cover"
                                    />

                                ) : (

                                    <div className="w-full h-52 bg-gray-200 flex items-center justify-center">

                                        <span className="text-gray-400">
                                            No Image
                                        </span>

                                    </div>

                                )}


                                <div className="p-5">


                                    {/* =====================================
                                        STATUS
                                    ===================================== */}

                                    <div className="flex items-center justify-between gap-2">

                                        <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">

                                            {blog.category}

                                        </span>


                                        {blog.isPublished ? (

                                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">

                                                ✓ Published

                                            </span>

                                        ) : (

                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">

                                                ⏳ Pending

                                            </span>

                                        )}

                                    </div>


                                    {/* =====================================
                                        TITLE
                                    ===================================== */}

                                    <h2 className="text-lg font-semibold text-gray-800 mt-4 line-clamp-2">

                                        {blog.title}

                                    </h2>


                                    {/* =====================================
                                        SUBTITLE
                                    ===================================== */}

                                    {blog.subTitle && (

                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">

                                            {blog.subTitle}

                                        </p>

                                    )}


                                    {/* =====================================
                                        AUTHOR
                                    ===================================== */}

                                    <p className="text-xs text-gray-400 mt-4">

                                        By {blog.authorName || user.username}

                                    </p>


                                    {/* =====================================
                                        DATE
                                    ===================================== */}

                                    {blog.createdAt && (

                                        <p className="text-xs text-gray-400 mt-1">

                                            {new Date(
                                                blog.createdAt
                                            ).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                }
                                            )}

                                        </p>

                                    )}


                                    {/* =====================================
                                        BUTTON
                                    ===================================== */}

                                    {blog.isPublished ? (

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/blog/${blog._id}`
                                                )
                                            }
                                            className="mt-5 w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm hover:bg-indigo-700"
                                        >
                                            Read Blog →
                                        </button>

                                    ) : (

                                        <div className="mt-5 w-full bg-yellow-50 border border-yellow-200 text-yellow-700 py-2.5 rounded-lg text-sm text-center">

                                            Waiting for admin approval

                                        </div>

                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );

};

export default MyBlogs;