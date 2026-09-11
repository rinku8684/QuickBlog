import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">

            <div className="bg-white w-full max-w-2xl p-8 md:p-10 rounded-2xl shadow-lg">

                {/* HEADER */}
                <div className="text-center mb-8">

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Welcome to QuickBlog
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Please select how you want to login
                    </p>

                </div>


                {/* LOGIN OPTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ADMIN LOGIN */}
                    <button
                        type="button"
                        onClick={() => navigate("/admin-login")}
                        className="group border-2 border-gray-200 rounded-xl p-7 hover:border-[#F25022] hover:shadow-md transition-all cursor-pointer"
                    >

                        <div className="text-5xl mb-4">
                            👨‍💼
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800">
                            Login as Admin
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Manage blogs, users, comments and dashboard
                        </p>

                        <div className="mt-5 inline-block bg-[#F25022] text-white px-5 py-2 rounded-lg text-sm">
                            Admin Login
                        </div>

                    </button>


                    {/* USER LOGIN */}
                    <button
                        type="button"
                        onClick={() => navigate("/user-login")}
                        className="group border-2 border-gray-200 rounded-xl p-7 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    >

                        <div className="text-5xl mb-4">
                            👤
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800">
                            Login as User
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Create blogs, manage your profile and explore content
                        </p>

                        <div className="mt-5 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm">
                            User Login
                        </div>

                    </button>

                </div>


                {/* BACK HOME */}
                <div className="text-center mt-8">

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-sm text-gray-500 hover:text-gray-800"
                    >
                        ← Back to Home
                    </button>

                </div>

            </div>

        </div>
    );
};

export default RoleSelection;