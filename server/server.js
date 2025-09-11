// server.js
import express from "express"; // if using ES modules (check package.json "type": "module")
// const express = require("express"); // uncomment this instead if using CommonJS

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Simple test route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
