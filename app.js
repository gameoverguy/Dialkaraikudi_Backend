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
  "http://192.168.1.13:5173",
  "http://192.168.1.12:5173",
  "http://192.168.1.9:5173",
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

// 🔗 Routes
const businessRoutes = require("./routes/businessRoutes");
app.use("/api/businesses", businessRoutes);

const reviewRoute = require("./routes/review");
app.use("/api/reviews", reviewRoute);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

module.exports = app;
