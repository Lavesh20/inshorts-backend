const express = require("express");
const { addNews, getNewsByCategory, updateNews, deleteNews, getAllCustomNews } = require("../controllers/newsController");
const adminAuth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();
router.get("/all", getAllCustomNews);
router.post("/add",  upload.single("photo"), addNews); 
router.get("/:category", getNewsByCategory); 
router.put("/:id", adminAuth, upload.single("photo"), updateNews); 
router.delete("/:id", adminAuth, deleteNews); 


module.exports = router;