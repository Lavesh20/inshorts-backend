const express = require("express");
const multer = require("multer");
const path = require("path");
const { createBlog, getAllBlogs, getBlogById, deleteBlog } = require("../controllers/blogController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/", upload.single("coverImage"), createBlog);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.delete("/:id", deleteBlog);

module.exports = router;