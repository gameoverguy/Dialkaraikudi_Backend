const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        tls: true,
      })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.error("MongoDBf    error:", err));
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
