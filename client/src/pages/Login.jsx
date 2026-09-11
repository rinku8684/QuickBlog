import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const Login = () => {

  const {
    axios,
    setUserToken,
    setUser
  } = useAppContext();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");


  // =====================================================
  // LOGIN USER
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;


    // Check identifier
    if (!identifier.trim()) {

      return toast.error(
        "Enter email, username or phone number"
      );

    }


    // Check password
    if (!password) {

      return toast.error(
        "Enter your password"
      );

    }


    try {

      setLoading(true);


      const { data } = await axios.post(
        "/api/user/login",
        {
          identifier: identifier.trim(),
          password: password
        }
      );


      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      if (data.success) {

        // -----------------------------------------
        // SAVE TOKEN IN LOCAL STORAGE
        // -----------------------------------------

        if (data.token) {

          localStorage.setItem(
            "userToken",
            data.token
          );

          // IMPORTANT:
          // Update Context immediately
          setUserToken(data.token);

        }


        // -----------------------------------------
        // SAVE USER DATA
        // -----------------------------------------

        if (data.user) {

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );

          // IMPORTANT:
          // Update Context immediately
          setUser(data.user);

        }


        // -----------------------------------------
        // SUCCESS MESSAGE
        // -----------------------------------------

        toast.success(
          data.message || "Login successful"
        );


        // -----------------------------------------
        // GO TO HOME
        // -----------------------------------------

        navigate("/");

      } else {

        toast.error(
          data.message || "Login failed"
        );

      }

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 md:p-8">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="text-center mb-6">

          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Login to your QuickBlog account
          </p>

        </div>


        {/* =====================================================
            LOGIN FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >


          {/* EMAIL / USERNAME / PHONE */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email, Username or Phone
            </label>

            <input
              type="text"
              value={identifier}
              onChange={(e) =>
                setIdentifier(e.target.value)
              }
              placeholder="Enter email, username or phone"
              required
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
            />

          </div>


          {/* PASSWORD */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
            />

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition"
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        {/* =====================================================
            REGISTER LINK
        ===================================================== */}

        <p className="text-center text-sm text-gray-500 mt-5">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Create Account
          </Link>

        </p>

      </div>

    </div>

  );

};

export default Login;