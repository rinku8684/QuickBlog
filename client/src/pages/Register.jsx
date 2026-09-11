import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const Register = () => {

  const navigate = useNavigate();
  const { axios } = useAppContext();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // =====================================================
  // REGISTER USER
  // =====================================================

  const onSubmitHandler = async (e) => {

    e.preventDefault();

    if (loading) {
      return;
    }

    // =====================================================
    // FRONTEND VALIDATION
    // =====================================================

    if (!username.trim()) {
      return toast.error("Please enter username");
    }

    if (!email.trim()) {
      return toast.error("Please enter email");
    }

    if (!phone.trim()) {
      return toast.error("Please enter phone number");
    }

    if (!password) {
      return toast.error("Please enter password");
    }

    if (!confirmPassword) {
      return toast.error("Please confirm your password");
    }

    if (password.length < 6) {
      return toast.error(
        "Password must contain at least 6 characters"
      );
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {

      setLoading(true);

      // =====================================================
      // REGISTER API
      // =====================================================

      const { data } = await axios.post(
        "/api/user/register",
        {
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password,
          confirmPassword: confirmPassword
        }
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      if (data.success) {

        toast.success(
          data.message || "Registration successful"
        );

        // Save token if backend sends one
        if (data.token) {

          localStorage.setItem(
            "userToken",
            data.token
          );

        }

        // Save user data if backend sends it
        if (data.user) {

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );

        }

        // Go to login page
        navigate("/login");

      } else {

        toast.error(
          data.message || "Registration failed"
        );

      }

    } catch (error) {

      console.error(
        "Register error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);

    }

  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 md:p-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="text-center mb-6">

          <h1 className="text-2xl font-bold text-gray-800">
            Create Account
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Register your QuickBlog account
          </p>

        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={onSubmitHandler}
          className="space-y-4"
        >

          {/* USERNAME */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
            />

          </div>

          {/* EMAIL */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
            />

          </div>

          {/* PHONE */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="Enter 10-digit phone number"
              maxLength={10}
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
            />

          </div>

          {/* CONFIRM PASSWORD */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
            />

          </div>

          {/* CREATE ACCOUNT BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-60 transition"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

        </form>

        {/* =====================================================
            LOGIN
        ===================================================== */}

        <p className="text-sm text-center text-gray-500 mt-5">

          Already have an account?

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="ml-1 text-indigo-600 font-medium hover:underline"
          >
            Login
          </button>

        </p>

      </div>

    </div>

  );

};

export default Register;