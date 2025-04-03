
// const CustomNews = require("../models/CustomNews");
// const fs = require("fs");
// const path = require("path");

// // 🆕 Add News with Image Upload
// exports.addNews = async (req, res) => {
//   try {
//     const { title, description, category , url } = req.body;
//     const photo = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

//     if (!photo) {
//       return res.status(400).json({ message: "Image is required!" });
//     }

//     const news = new CustomNews({ title, description, photo, category ,url });
//     await news.save();

//     res.status(201).json({ message: "News added successfully", news });
//   } catch (error) {
//     console.error("Error adding news:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // 📜 Get News by Category (Handles "all" correctly)
// exports.getNewsByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;
    
//     // Log to debug
//     console.log("Requested category:", category);
    
//     // Create a query object - only filter by category if it's provided and not empty
//     // Check for case-insensitive match (important if your data might have mixed case)
//     const query = category && category !== "undefined" && category !== "" 
//       ? { category: new RegExp(category, 'i') } // Use regex for case-insensitivity
//       : {};
    
//     // Log the query to debug
//     console.log("MongoDB query:", query);
    
//     // Fetch data from MongoDB
//     const news = await CustomNews.find(query);
    
//     // Log the result count and the actual data for debugging
//     console.log(`Found ${news.length} matching news items`);
//     console.log("First news item (if any):", news.length > 0 ? news[0] : "No data");
    
//     // Transform the data to match the expected format in your frontend
//     const transformedNews = news.map(item => ({
//       title: item.title,
//       description: item.description,
//       image: item.photo, // Map photo to image
//       url: item.url, // Default URL since it's not in your schema
//       publishedAt: item.createdAt, // Use createdAt from timestamps
//       source: {
//         name: item.by, // Use "by" field as source name
//         url: item.url
//       },
//       category: item.category
//     }));
    
//     res.status(200).json(transformedNews);
//   } catch (error) {
//     console.error("Error fetching custom news:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // 📝 Update News with Image Upload (if provided)
// exports.updateNews = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let updatedFields = req.body;

//     if (req.file) {
//       updatedFields.photo = `/uploads/${req.file.filename}`;
//     }

//     const updatedNews = await CustomNews.findByIdAndUpdate(id, updatedFields, { new: true });

//     if (!updatedNews) return res.status(404).json({ message: "News not found" });

//     res.status(200).json({ message: "News updated successfully", updatedNews });
//   } catch (error) {
//     console.error("Error updating news:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ❌ Delete News (Deletes Image too)
// exports.deleteNews = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const news = await CustomNews.findById(id);

//     if (!news) return res.status(404).json({ message: "News not found" });

//     // Delete image file from server if it exists
//     if (news.photo) {
//       const imagePath = path.join(__dirname, "..", news.photo);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     }

//     await news.deleteOne();
//     res.status(200).json({ message: "News deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting news:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // 📢 Get All Custom News (No Category Filter)
// exports.getAllCustomNews = async (req, res) => {
//   try {
//     const news = await CustomNews.find();
    
//     console.log("Fetched News:", news.length, "items"); // Debugging output

//     if (news.length === 0) {
//       console.log("No news found in database.");
//     }

//     res.status(200).json(news);
//   } catch (error) {
//     console.error("Error fetching all news:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


const CustomNews = require("../models/CustomNews");
const cloudinary = require("../config/cloudinary"); // Import Cloudinary configuration

// 🆕 Add News with Cloudinary Image Upload
exports.addNews = async (req, res) => {
  try {
    const { title, description, category, url } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required!" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "news", // Organize images in a "news" folder
    });

    const news = new CustomNews({
      title,
      description,
      photo: result.secure_url, // Store Cloudinary URL
      category,
      url,
      cloudinary_id: result.public_id, // Store Cloudinary image ID
    });

    await news.save();
    res.status(201).json({ message: "News added successfully", news });
  } catch (error) {
    console.error("Error adding news:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📜 Get News by Category (Handles "all" correctly)
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log("Requested category:", category);

    const query =
      category && category !== "undefined" && category !== ""
        ? { category: new RegExp(category, "i") }
        : {};

    const news = await CustomNews.find(query);
    console.log(`Found ${news.length} matching news items`);

    const transformedNews = news.map((item) => ({
      title: item.title,
      description: item.description,
      image: item.photo,
      url: item.url,
      publishedAt: item.createdAt,
      source: {
        name: item.by,
        url: item.url,
      },
      category: item.category,
    }));

    res.status(200).json(transformedNews);
  } catch (error) {
    console.error("Error fetching custom news:", error);
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
        await cloudinary.uploader.destroy(news.cloudinary_id); // Delete old image from Cloudinary
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "news",
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
      await cloudinary.uploader.destroy(news.cloudinary_id); // Delete image from Cloudinary
    }

    await news.deleteOne();
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📢 Get All Custom News (No Category Filter)
exports.getAllCustomNews = async (req, res) => {
  try {
    const news = await CustomNews.find().sort({ createdAt: -1 });
    
    console.log("Fetched News:", news.length, "items"); // Debugging output
    
    if (news.length === 0) {
      console.log("No news found in database.");
    }
    
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching all news:", error);
    res.status(500).json({ message: error.message });
  }
};