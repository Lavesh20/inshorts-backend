const mongoose = require("mongoose");

const CustomNewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: true }, // 🔹 Cloudinary Image URL
    cloudinary_id: { type: String, required: true }, // 🔹 Image ID for deletion
    category: { type: String, required: true },
    url: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomNews", CustomNewsSchema);