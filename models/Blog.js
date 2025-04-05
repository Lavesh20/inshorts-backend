const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  categories: { type: [String], required: true },
  coverImage: { type: String, default: null }, // Store image URL
  content: [
    {
      title: String,
      paragraphs: [String],
    },
  ],
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Blog", blogSchema);

// const mongoose = require("mongoose");

// const blogSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     categories: { type: [String], required: true },
//     coverImage: {
//       url: { type: String, default: null },
//       publicId: { type: String, default: null },
//     },
//     content: [
//       {
//         title: String,
//         paragraphs: [String],
//       },
//     ],
//     authorName: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Blog", blogSchema);
