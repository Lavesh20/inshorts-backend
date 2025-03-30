const express = require("express");
const { addNews, getNewsByCategory, updateNews, deleteNews, getAllCustomNews } = require("../controllers/newsController");
const adminAuth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/add",  upload.single("photo"), addNews); // Add news with image
router.get("/:category", getNewsByCategory); // Get news by category
router.put("/:id", adminAuth, upload.single("photo"), updateNews); // Update news (optional image)
router.delete("/:id", adminAuth, deleteNews); // Delete news (removes image too)
router.get("/all", getAllCustomNews);

module.exports = router;
