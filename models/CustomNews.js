const mongoose = require("mongoose");

const customNewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String, required: true },
  category: { type: String, required: true },
  url:{type:String},
  by: { type: String, default: "Admin" },
}, { timestamps: true, collection: "customnews" }); // 👈 Force collection name

module.exports = mongoose.model("CustomNews", customNewsSchema);

