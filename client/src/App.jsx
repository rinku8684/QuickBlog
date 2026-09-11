import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Blog from "./pages/Blog";

// =========================
// Admin pages
// =========================
import Layout from "./pages/asset/Layout";
import Dashboard from "./pages/asset/Dashboard";
import Addblog from "./pages/asset/Addblog";
import Listblog from "./pages/asset/Listblog";
import Editblog from "./pages/asset/Editblog";
import Comments from "./pages/asset/Comments";

// =========================
// Admin login
// =========================
import AdminLogin from "./components/admin/Login";

// =========================
// User authentication pages
// =========================
import Login from "./pages/Login";
import Register from "./pages/Register";

// =========================
// Role Selection
// =========================
import RoleSelection from "./pages/RoleSelection";

// =========================
// User pages
// =========================
import Profile from "./pages/Profile";
import AddBlog from "./pages/AddBlog";
import MyBlogs from "./pages/MyBlogs";

import "quill/dist/quill.snow.css";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";


const App = () => {

  const {
    token,
    userToken
  } = useAppContext();


  return (

    <div>

      <Toaster />


      <Routes>

        {/* =========================================
            PUBLIC USER PAGES
        ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/blog/:id"
          element={<Blog />}
        />


        {/* =========================================
            LOGIN ROLE SELECTION
        ========================================= */}

        <Route
          path="/login"
          element={<RoleSelection />}
        />


        {/* =========================================
            USER AUTHENTICATION
        ========================================= */}

        <Route
          path="/user-login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================================
            USER PROFILE
        ========================================= */}

        <Route
          path="/profile"
          element={
            userToken
              ? <Profile />
              : <Login />
          }
        />


        {/* =========================================
            USER ADD BLOG
        ========================================= */}

        <Route
          path="/add-blog"
          element={
            userToken
              ? <AddBlog />
              : <Login />
          }
        />


        {/* =========================================
            MY BLOGS
            Only logged-in user's blogs
        ========================================= */}

        <Route
          path="/my-blogs"
          element={
            userToken
              ? <MyBlogs />
              : <Login />
          }
        />


        {/* =========================================
            ADMIN LOGIN
        ========================================= */}

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />


        {/* =========================================
            ADMIN PANEL
        ========================================= */}

        <Route
          path="/admin"
          element={
            token
              ? <Layout />
              : <AdminLogin />
          }
        >

          {/* Dashboard */}

          <Route
            index
            element={<Dashboard />}
          />


          {/* Add Blog */}

          <Route
            path="addBlog"
            element={<Addblog />}
          />


          {/* List Blogs */}

          <Route
            path="listBlog"
            element={<Listblog />}
          />


          {/* Edit Blog */}

          <Route
            path="editBlog/:id"
            element={<Editblog />}
          />


          {/* Comments */}

          <Route
            path="comments"
            element={<Comments />}
          />

        </Route>


      </Routes>

    </div>

  );

};


export default App;