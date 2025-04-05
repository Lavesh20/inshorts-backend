const Blog = require("../models/Blog");
const cloudinary = require("../config/cloudinary");

// ✅ Create Blog Post with Cloudinary
exports.createBlog = async (req, res) => {
  try {
    const { title, categories, content, authorName } = req.body;

    // Upload image to Cloudinary if provided
    let coverImage = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blog_images",
      });
      coverImage = result.secure_url;
    }

    const newBlog = new Blog({
      title,
      categories: categories.split(",").map((cat) => cat.trim()),
      coverImage,
      content: JSON.parse(content),
      authorName,
    });

    await newBlog.save();
    res.status(201).json({ message: "✅ Blog published successfully!", blog: newBlog });
  } catch (error) {
    console.error("❌ Error publishing blog:", error);
    res.status(500).json({ message: "❌ Failed to publish blog." });
  }
};

// ✅ Get All Blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ message: "❌ Failed to fetch blogs." });
  }
};

// ✅ Get Single Blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "❌ Blog not found" });

    res.status(200).json(blog);
  } catch (error) {
    console.error("❌ Error fetching blog:", error);
    res.status(500).json({ message: "❌ Failed to fetch blog." });
  }
};

// ✅ Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: "❌ Blog not found" });

    res.status(200).json({ message: "✅ Blog deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ message: "❌ Failed to delete blog." });
  }
};

