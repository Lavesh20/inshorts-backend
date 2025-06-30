const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/database");
const session = require("express-session");
const jwt = require("jsonwebtoken");

// Import Routes & Models
const adminRoutes = require("./routes/adminRoutes");
const newsRoutes = require("./routes/newsRoutes");
const blogRoutes = require("./routes/blogRoutes");
const userRoutes = require("./routes/userRoutes");
const Admin = require("./models/Admin");

// Cloudinary Config
const cloudinary = require("./config/cloudinary");

dotenv.config();
connectDB();

const app = express();

// CORS Configuration
const allowedOrigins = [
  "https://tickershorts.vercel.app",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to your Express application" });
});

// One-Time Admin Creation or Update Password
const createOrUpdateAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const newAdmin = new Admin({
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
      });

      await newAdmin.save();
      console.log("Admin account created successfully!");
    } else {
      const isMatch = await bcrypt.compare(process.env.ADMIN_PASSWORD, existingAdmin.password);
      if (!isMatch) {
        console.log("Updating Admin Password...");
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log("Admin password updated successfully!");
      } else {
        console.log("Admin already exists, skipping creation.");
      }
    }
  } catch (error) {
    console.error("Error creating/updating admin:", error);
  }
};

// Start Server After Admin Check
const startServer = async () => {
  await createOrUpdateAdmin();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();