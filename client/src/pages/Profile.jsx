import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Profile = () => {

    const {
        user,
        userToken,
        logoutUser
    } = useAppContext();

    const navigate = useNavigate();


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

            <div className="max-w-2xl mx-auto">

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

                    <div className="mt-8 space-y-4">


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

                            <p className="font-medium text-gray-800 mt-1">
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

            </div>

        </div>

    );

};

export default Profile;