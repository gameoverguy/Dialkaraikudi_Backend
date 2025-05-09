const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB(); // MongoDB connection

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://192.168.1.13:5173",
  "http://192.168.1.12:5173",
  "http://192.168.1.9:5173",
  "https://lucky-choux-a6d99e.netlify.app",
];

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "12345",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

// Import routers
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const businessRoutes = require("./routes/businessRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const categoryRoute = require("./routes/categoryRoutes");

// Route Mounting
app.use("/auth", authRoutes); // login
app.use("/user", userRoutes); // signup, forgot-password, reset-password for users
app.use("/admin", adminRoutes); // forgot-password, reset-password for admins
app.use("/business", businessRoutes); //business CRUD operations
app.use("/reviews", reviewRoutes); //review and rating crud operations
app.use("/categories", categoryRoute); //category CRUD operations

// Example Home
app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;
