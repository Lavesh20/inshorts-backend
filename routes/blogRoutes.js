// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const { createBlog, getAllBlogs, getBlogById, deleteBlog } = require("../controllers/blogController");

// const router = express.Router();

// // ✅ Configure Multer for File Uploads
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });

// // ✅ Blog Routes
// router.post("/", upload.single("coverImage"), createBlog);
// router.get("/", getAllBlogs);
// router.get("/:id", getBlogById);
// router.delete("/:id", deleteBlog);

// module.exports = router;

const express = require("express");
const router = express.Router();

// 🔹 Import Cloudinary upload middleware (no local storage)
const upload = require("../middleware/uploadMiddleware");

// 🔹 Import all blog controllers
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

// ✅ Create Blog (with image upload)
router.post("/", upload.single("coverImage"), createBlog);

// ✅ Get all blogs
router.get("/", getAllBlogs);

// ✅ Get single blog by ID
router.get("/:id", getBlogById);

// ✅ Update Blog (with optional image update)
router.put("/:id", upload.single("coverImage"), updateBlog);

// ✅ Delete Blog (and remove image from Cloudinary)
router.delete("/:id", deleteBlog);

module.exports = router;