import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";
import Moment from "moment";
import Footer from "../components/Footer";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Blog = () => {

  const { id } = useParams();

  const { axios } = useAppContext();

  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  // =====================================================
  // FETCH BLOG
  // =====================================================

  const fetchBlogData = async () => {

    try {

      const { data } = await axios.get(
        `/api/blog/${id}`
      );

      if (data.success) {

        setData(data.blog);

      } else {

        toast.error(
          data.message || "Blog not found"
        );

      }

    } catch (error) {

      console.error(
        "Fetch Blog Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to load blog"
      );

    }

  };


  // =====================================================
  // FETCH COMMENTS
  // =====================================================

  const fetchComments = async () => {

    try {

      const { data } = await axios.post(
        "/api/blog/comments",
        {
          blogId: id
        }
      );

      if (data.success) {

        setComments(
          data.comments || []
        );

      } else {

        toast.error(
          data.message ||
          "Unable to load comments"
        );

      }

    } catch (error) {

      console.error(
        "Fetch Comments Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to load comments"
      );

    }

  };


  // =====================================================
  // ADD COMMENT
  // =====================================================

  const addComment = async (e) => {

    e.preventDefault();

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!name.trim()) {

      toast.error(
        "Please enter your name"
      );

      return;

    }

    if (!content.trim()) {

      toast.error(
        "Please write a comment"
      );

      return;

    }


    try {

      const { data } = await axios.post(
        "/api/blog/add-comment",
        {
          blog: id,
          name: name.trim(),
          content: content.trim()
        }
      );


      if (data.success) {

        toast.success(
          data.message ||
          "Comment added successfully"
        );

        // Clear form
        setName("");
        setContent("");

        // Refresh comments
        await fetchComments();

      } else {

        toast.error(
          data.message ||
          "Unable to add comment"
        );

      }

    } catch (error) {

      console.error(
        "Add Comment Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to add comment"
      );

    }

  };


  // =====================================================
  // LOAD BLOG + COMMENTS
  // =====================================================

  useEffect(() => {

    fetchBlogData();
    fetchComments();

  }, [id]);


  // =====================================================
  // BLOG LOADING
  // =====================================================

  if (!data) {

    return (
      <div className="text-center mt-20 text-gray-600">
        Loading blog...
      </div>
    );

  }


  // =====================================================
  // BLOG PAGE
  // =====================================================

  return (

    <div className="relative">

      {/* Background */}

      <img
        src={assets.gradientBackground}
        alt=""
        className="absolute top-0 -z-10 opacity-50 w-full"
      />


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />


      {/* =====================================================
          BLOG HEADER
      ===================================================== */}

      <div className="text-center mt-20 text-gray-600">

        <p className="text-blue py-4 font-medium">

          Published on{" "}

          {Moment(data.createdAt).format(
            "MMMM Do YYYY"
          )}

        </p>


        <h1 className="text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800">

          {data.title}

        </h1>


        <h2 className="my-5 max-w-lg truncate mx-auto">

          {data.subTitle}

        </h2>


        <p className="inline-block py-1 px-4 rounded-full mb-6 border text-sm border-blue/35 bg-blue/5 font-medium text-blue">

          Michael Brown

        </p>

      </div>


      {/* =====================================================
          BLOG CONTENT
      ===================================================== */}

      <div className="mx-5 max-w-5xl md:mx-auto mt-10">


        <img
          src={data.image}
          alt={data.title}
          className="rounded-3xl mb-5 w-full"
        />


        <div
          className="rich-text max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{
            __html: data.description
          }}
        />


        {/* =====================================================
            COMMENTS SECTION
        ===================================================== */}

        <div className="mt-14 mb-10 max-w-3xl mx-auto">


          {/* COMMENT COUNT */}

          <p className="font-semibold text-gray-700">

            Comments ({comments?.length || 0})

          </p>


          {/* ===================================================
              EXISTING COMMENTS
          =================================================== */}

          <div className="flex flex-col gap-4 mt-4">

            {comments?.length > 0 ? (

              comments.map((item, index) => (

                <div
                  key={item._id || index}
                  className="relative bg-blue/2 border border-blue/5 max-w-xl p-4 rounded text-gray-600"
                >

                  <div className="flex items-center gap-2 mb-2">

                    <img
                      src={assets.user_icon}
                      alt=""
                      className="w-6"
                    />

                    <p className="font-medium">

                      {item.name}

                    </p>

                  </div>


                  <p className="text-sm max-w-md ml-8">

                    {item.content}

                  </p>


                  <div className="absolute right-4 bottom-3 flex items-center gap-2 text-xs text-gray-400">

                    {Moment(
                      item.createdAt
                    ).fromNow()}

                  </div>

                </div>

              ))

            ) : (

              <p className="text-sm text-gray-400 mt-3">

                No comments yet. Be the first to comment!

              </p>

            )}

          </div>


          {/* =====================================================
              ADD COMMENT
          ===================================================== */}

          <div className="max-w-3xl mx-auto mt-8">

            <p className="font-semibold mb-4">

              Add your comment

            </p>


            {/* COMMENT FORM */}

            <form
              onSubmit={addComment}
              className="flex flex-col items-start gap-4 max-w-lg"
            >


              {/* NAME */}

              <input
                onChange={(e) =>
                  setName(e.target.value)
                }
                value={name}
                type="text"
                placeholder="Name"
                required
                className="w-full p-3 border border-gray-300 rounded outline-none focus:border-blue-500"
              />


              {/* COMMENT */}

              <textarea
                onChange={(e) =>
                  setContent(e.target.value)
                }
                value={content}
                placeholder="Comment"
                required
                className="w-full p-3 border border-gray-300 rounded outline-none h-40 focus:border-blue-500 resize-none"
              />


              {/* SUBMIT BUTTON */}

              <div className="flex justify-start mt-2">

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-8 py-2 rounded hover:bg-blue-600 hover:scale-105 transition-all cursor-pointer"
                >

                  Submit

                </button>

              </div>

            </form>

          </div>


          {/* =====================================================
              SHARE BUTTONS
          ===================================================== */}

          <div className="my-24 max-w-3xl mx-auto">

            <p className="font-semibold my-4">

              Share this article on social media

            </p>


            <div className="flex gap-2">

              <img
                src={assets.facebook_icon}
                width={50}
                alt="Facebook"
              />


              <img
                src={assets.twitter_icon}
                width={50}
                alt="Twitter"
              />


              <img
                src={assets.googleplus_icon}
                width={50}
                alt="Google Plus"
              />

            </div>

          </div>


        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <Footer />

      </div>

    </div>

  );

};

export default Blog;