const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./route/authRoutes");
const passwordRoutes = require("./route/passwordRoute");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Lost & Found Backend Running");
});

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected updated");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
  });
