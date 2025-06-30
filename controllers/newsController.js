const CustomNews = require("../models/CustomNews");
const cloudinary = require("../config/cloudinary");

// 🆕 Add News with Cloudinary Image Upload
exports.addNews = async (req, res) => {
  try {
    const { title, description, category, url } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required!" });
    }

    // Upload image to Cloudinary (Stored in 'images' folder)
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "images", // 🔹 Changed to "images"
    });

    const news = new CustomNews({
      title,
      description,
      photo: result.secure_url, // 🔹 Store Cloudinary image URL
      category,
      url,
      cloudinary_id: result.public_id, // 🔹 Store Cloudinary image ID for deletion
    });

    await news.save();
    res.status(201).json({ message: "News added successfully", news });
  } catch (error) {
    console.error("Error adding news:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📜 Get News by Category (Ensures Images are Fetched Correctly)
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log("Requested category:", category);

    const query = category && category !== "undefined" && category !== "" 
      ? { category: new RegExp(category, "i") } 
      : {};

    const news = await CustomNews.find(query).sort({ createdAt: -1 });

    if (!news || news.length === 0) {
      return res.status(404).json({ message: "No news found in this category" });
    }

    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news by category:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📝 Update News with Cloudinary Image Upload (if provided)
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    let updatedFields = req.body;

    const news = await CustomNews.findById(id);
    if (!news) return res.status(404).json({ message: "News not found" });

    // Upload new image if provided
    if (req.file) {
      if (news.cloudinary_id) {
        await cloudinary.uploader.destroy(news.cloudinary_id); // 🔹 Delete old image
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "images", // 🔹 Changed to "images"
      });

      updatedFields.photo = result.secure_url;
      updatedFields.cloudinary_id = result.public_id;
    }

    const updatedNews = await CustomNews.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    res.status(200).json({ message: "News updated successfully", updatedNews });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete News (Deletes Cloudinary Image too)
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await CustomNews.findById(id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.cloudinary_id) {
      await cloudinary.uploader.destroy(news.cloudinary_id); // 🔹 Delete Cloudinary image
    }

    await news.deleteOne();
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📢 Get All Custom News (Fixes Image Fetching)
exports.getAllCustomNews = async (req, res) => {
  try {
    const news = await CustomNews.find().sort({ createdAt: -1 });

    console.log("Fetched News:", news.length, "items");

    if (news.length === 0) {
      return res.status(404).json({ message: "No news found" });
    }

    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching all news:", error);
    res.status(500).json({ message: error.message });
  }
};