import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { blogCategories } from "../../assets/assets";
import Quill from "quill";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import AIStudio from "../../components/admin/AIStudio";

const Editblog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios } = useAppContext();

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Startup");
  const [isPublished, setIsPublished] = useState(false);
  const [seoData, setSeoData] = useState(null);

  const sanitizeMessage = (msg) => {
    if (!msg) return "An error occurred";
    const value = typeof msg === "string" ? msg : JSON.stringify(msg);
    try {
      const parsed = JSON.parse(value);
      if (parsed?.error?.message) return parsed.error.message;
      if (parsed?.message) return String(parsed.message);
    } catch (_) {}
    return value.length > 240 ? `${value.slice(0, 240)}…` : value;
  };

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;
    quillRef.current = new Quill(editorRef.current, { theme: "snow" });
  }, []);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/blog/${id}`);
        if (!data.success) {
          toast.error(data.message || "Blog not found");
          navigate("/admin/listBlog");
          return;
        }

        const blog = data.blog;
        setTitle(blog.title || "");
        setSubtitle(blog.subTitle || "");
        setCategory(blog.category || "Startup");
        setIsPublished(Boolean(blog.isPublished));
        setCurrentImage(blog.image || "");
        setSeoData({
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          slug: blog.slug || "",
          focusKeyword: blog.focusKeyword || "",
          seoKeywords: blog.seoKeywords || [],
          seoTips: blog.seoTips || [],
        });

        if (quillRef.current) {
          quillRef.current.root.innerHTML = blog.description || "";
        }
      } catch (error) {
        toast.error(sanitizeMessage(error.response?.data?.message || error.message));
        navigate("/admin/listBlog");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadBlog();
  }, [id, axios, navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (saving) return;

    const description = quillRef.current?.root?.innerHTML || "";
    if (!title.trim()) return toast.error("Please enter a blog title");
    if (!description || description === "<p><br></p>") return toast.error("Please add blog content");

    try {
      setSaving(true);
      const blog = {
        id,
        title,
        subTitle: subtitle,
        description,
        category,
        isPublished,
        ...(seoData || {}),
      };

      const formData = new FormData();
      formData.append("blog", JSON.stringify(blog));
      if (image) formData.append("image", image);

      const { data } = await axios.post("/api/blog/update", formData);
      if (!data.success) {
        toast.error(sanitizeMessage(data.message));
        return;
      }

      toast.success("Blog updated successfully");
      navigate("/admin/listBlog");
    } catch (error) {
      toast.error(sanitizeMessage(error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-blue-50/50">
        <div className="text-sm text-gray-600">Loading blog...</div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitHandler} className="flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll">
      <div className="bg-white w-full max-w-4xl p-4 md:p-10 shadow rounded">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">✏️ Edit Blog</h1>
            <p className="text-xs text-gray-500 mt-1">Update your blog, use AI tools, regenerate SEO and save changes.</p>
          </div>
          <button type="button" onClick={() => navigate("/admin/listBlog")} className="px-3 py-2 text-xs rounded border hover:bg-gray-50">← Back</button>
        </div>

        <p>Current Thumbnail</p>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {currentImage && <img src={currentImage} alt="Current thumbnail" className="h-20 w-32 object-cover rounded border" />}
          {image && <img src={URL.createObjectURL(image)} alt="New thumbnail" className="h-20 w-32 object-cover rounded border" />}
          <label htmlFor="edit-image" className="px-3 py-2 text-xs border rounded cursor-pointer hover:bg-gray-50">📷 Change Thumbnail</label>
          <input id="edit-image" type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </div>

        <p className="mt-4">Blog Title</p>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded" />

        <p className="mt-4">Sub Title</p>
        <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded" />

        <p className="mt-4">Blog Description</p>
        <div className="max-w-lg pb-4 pt-2 relative">
          <div ref={editorRef}></div>
        </div>

        <AIStudio
          title={title}
          subtitle={subtitle}
          category={category}
          getContent={() => quillRef.current?.root?.innerHTML || ""}
          onSEOGenerated={setSeoData}
          onContentChanged={(newContent) => {
            if (quillRef.current) quillRef.current.root.innerHTML = newContent;
          }}
        />

        <p className="mt-5">Blog Category</p>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded">
          {blogCategories.map((item, index) => <option key={index} value={item}>{item}</option>)}
        </select>

        <div className="flex gap-2 mt-4">
          <p>Publish Now</p>
          <input type="checkbox" checked={isPublished} className="scale-125 cursor-pointer" onChange={(e) => setIsPublished(e.target.checked)} />
        </div>

        <div className="flex flex-wrap gap-2 mt-8">
          <button disabled={saving} type="submit" className="w-44 h-10 bg-[#F25022] text-white rounded cursor-pointer text-sm disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate("/admin/listBlog")} className="w-32 h-10 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </form>
  );
};

export default Editblog;
