import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Profile = () => {

    const {
        user,
        userToken,
        logoutUser,
        axios
    } = useAppContext();

    const navigate = useNavigate();

    const [myBlogs, setMyBlogs] = useState([]);
    const [loadingBlogs, setLoadingBlogs] = useState(false);


    // ============================================
    // FETCH MY BLOGS
    // ============================================

    const fetchMyBlogs = async () => {

        if (!userToken) {
            return;
        }

        try {

            setLoadingBlogs(true);

            const { data } = await axios.get(
                "/api/user/blog/my",
                {
                    headers: {
                        Authorization: userToken
                    }
                }
            );

            if (data.success) {

                setMyBlogs(data.blogs || []);

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

            setLoadingBlogs(false);

        }

    };


    // ============================================
    // LOAD BLOGS
    // ============================================

    useEffect(() => {

        if (userToken) {
            fetchMyBlogs();
        }

    }, [userToken]);


    // ============================================
    // USER NOT LOGGED IN
    // ============================================

    if (!userToken || !user) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-gray-50">

                <div className="text-center">

                    <h2 className="text-2xl font-semibold text-gray-800">
                        Please Login First
                    </h2>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg"
                    >
                        Login
                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="min-h-screen bg-gray-50 px-4 py-10">

            <div className="max-w-5xl mx-auto">


                {/* ============================================
                    PROFILE CARD
                ============================================ */}

                <div className="bg-white rounded-2xl shadow-md p-8">

                    {/* PROFILE HEADER */}

                    <div className="flex flex-col items-center">

                        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold">

                            {user.username
                                ? user.username
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}

                        </div>


                        <h1 className="text-2xl font-bold text-gray-800 mt-4">

                            {user.username}

                        </h1>


                        <p className="text-gray-500 text-sm mt-1">

                            QuickBlog User

                        </p>

                    </div>


                    {/* ============================================
                        USER INFORMATION
                    ============================================ */}

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">


                        {/* USERNAME */}

                        <div className="border rounded-lg p-4">

                            <p className="text-sm text-gray-500">
                                Username
                            </p>

                            <p className="font-medium text-gray-800 mt-1">
                                {user.username}
                            </p>

                        </div>


                        {/* EMAIL */}

                        <div className="border rounded-lg p-4">

                            <p className="text-sm text-gray-500">
                                Email
                            </p>

                            <p className="font-medium text-gray-800 mt-1 break-all">
                                {user.email}
                            </p>

                        </div>


                        {/* PHONE */}

                        <div className="border rounded-lg p-4">

                            <p className="text-sm text-gray-500">
                                Phone Number
                            </p>

                            <p className="font-medium text-gray-800 mt-1">
                                {user.phone}
                            </p>

                        </div>

                    </div>


                    {/* ============================================
                        ACTION BUTTONS
                    ============================================ */}

                    <div className="flex flex-col sm:flex-row gap-3 mt-8">


                        {/* MY BLOGS */}

                        <button
                            onClick={() => navigate("/my-blogs")}
                            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700"
                        >
                            📝 My Blogs
                        </button>


                        {/* HOME */}

                        <button
                            onClick={() => navigate("/")}
                            className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50"
                        >
                            Back to Home
                        </button>


                        {/* LOGOUT */}

                        <button
                            onClick={logoutUser}
                            className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600"
                        >
                            Logout
                        </button>

                    </div>

                </div>


                {/* ============================================
                    MY BLOGS PREVIEW
                ============================================ */}

                <div className="mt-8">

                    <div className="flex items-center justify-between mb-5">

                        <div>

                            <h2 className="text-2xl font-bold text-gray-800">
                                My Blogs
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Blogs created from your account
                            </p>

                        </div>


                        <button
                            onClick={() => navigate("/my-blogs")}
                            className="text-indigo-600 text-sm font-medium hover:underline"
                        >
                            View All →
                        </button>

                    </div>


                    {/* LOADING */}

                    {loadingBlogs && (

                        <div className="bg-white rounded-xl p-8 text-center shadow-sm">

                            <p className="text-gray-500">
                                Loading your blogs...
                            </p>

                        </div>

                    )}


                    {/* NO BLOGS */}

                    {!loadingBlogs &&
                        myBlogs.length === 0 && (

                            <div className="bg-white rounded-xl p-8 text-center shadow-sm">

                                <div className="text-4xl">
                                    📝
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mt-3">
                                    No Blogs Yet
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    You haven't created any blogs yet.
                                </p>

                                <button
                                    onClick={() =>
                                        navigate("/add-blog")
                                    }
                                    className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
                                >
                                    Create Your First Blog
                                </button>

                            </div>

                        )}


                    {/* BLOG PREVIEW */}

                    {!loadingBlogs &&
                        myBlogs.length > 0 && (

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                                {myBlogs.slice(0, 3).map(
                                    (blog) => (

                                        <div
                                            key={blog._id}
                                            className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition"
                                        >

                                            {/* IMAGE */}

                                            {blog.image && (

                                                <img
                                                    src={blog.image}
                                                    alt={blog.title}
                                                    className="w-full h-44 object-cover"
                                                />

                                            )}


                                            <div className="p-4">

                                                {/* CATEGORY */}

                                                <span className="inline-block text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                                                    {blog.category}
                                                </span>


                                                {/* TITLE */}

                                                <h3 className="font-semibold text-gray-800 mt-3 line-clamp-2">

                                                    {blog.title}

                                                </h3>


                                                {/* SUBTITLE */}

                                                {blog.subTitle && (

                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">

                                                        {blog.subTitle}

                                                    </p>

                                                )}


                                                {/* STATUS */}

                                                <div className="mt-4">

                                                    {blog.isPublished ? (

                                                        <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                            ✓ Published
                                                        </span>

                                                    ) : (

                                                        <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                                                            ⏳ Pending Approval
                                                        </span>

                                                    )}

                                                </div>


                                                {/* VIEW */}

                                                {blog.isPublished && (

                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/blog/${blog._id}`
                                                            )
                                                        }
                                                        className="mt-4 text-sm text-indigo-600 font-medium hover:underline"
                                                    >
                                                        Read Blog →
                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                </div>

            </div>

        </div>

    );

};

export default Profile;