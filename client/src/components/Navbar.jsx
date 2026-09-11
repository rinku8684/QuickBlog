import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {

    const {
        navigate,
        user,
        userToken,
        logoutUser
    } = useAppContext();

    return (

        <div className="flex justify-between items-center py-5 mx-8 sm:mx-20 xl:mx-32">

            {/* LOGO */}

            <img
                onClick={() => navigate("/")}
                src={assets.logo}
                alt="logo"
                className="w-32 sm:w-44 cursor-pointer"
            />


            {/* RIGHT SIDE */}

            <div className="flex items-center gap-4">

                {/* USER DETAILS */}

                {userToken && user && (

                    <div className="flex items-center gap-2">

                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">

                            {user.username
                                ? user.username
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}

                        </div>

                        <span
                            onClick={() => navigate("/profile")}
                            className="font-medium text-gray-700 cursor-pointer hover:text-indigo-600"
                        >
                            {user.username}
                        </span>

                    </div>

                )}


                {/* ADD BLOG BUTTON */}

                {userToken && user && (

                    <button
                        onClick={() => navigate("/add-blog")}
                        className="rounded-full text-sm cursor-pointer bg-indigo-600 text-white px-5 py-2.5 hover:bg-indigo-700 transition"
                    >
                        Add Blog
                    </button>

                )}


                {/* LOGIN / LOGOUT */}

                {userToken ? (

                    <button
                        onClick={logoutUser}
                        className="rounded-full text-sm cursor-pointer bg-red-500 text-white px-7 py-2.5 hover:bg-red-600 transition"
                    >
                        Logout
                    </button>

                ) : (

                    <button
                        onClick={() => navigate("/login")}
                        className="rounded-full text-sm cursor-pointer bg-blue-500 text-white px-10 py-2.5 hover:bg-blue-600 transition"
                    >
                        Login
                    </button>

                )}

            </div>

        </div>

    );

};

export default Navbar;