const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

// ================= UPLOAD CONFIG =================
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 800 * 1024 } // 800KB safe limit for ESP32-CAM
});

// ================= UPLOAD ROUTE =================
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("NO FILE");
  }

  const target = path.join(__dirname, "latest.jpg");

  console.log("[UPLOAD] Received:", req.file.filename);

  // ⚡ Respond immediately (VERY IMPORTANT for ESP speed)
  res.status(200).send("OK");

  // ⚡ Async move (non-blocking)
  fs.rename(req.file.path, target, (err) => {
    if (err) {
      console.log("[ERROR] rename failed:", err);

      // fallback cleanup
      fs.unlink(req.file.path, () => {});
    } else {
      console.log("[UPLOAD] latest.jpg updated");
    }
  });
});

// ================= GET IMAGE =================
app.get("/latest.jpg", (req, res) => {
  const latestPath = path.join(__dirname, "latest.jpg");
  const defaultPath = path.join(__dirname, "default.jpg");

  // ⚡ disable caching so browser always shows latest image
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");

  // 1. serve latest uploaded frame
  if (fs.existsSync(latestPath)) {
    return res.sendFile(latestPath);
  }

  // 2. fallback to default offline image
  if (fs.existsSync(defaultPath)) {
    return res.sendFile(defaultPath);
  }

  // 3. emergency fallback (should never happen if default.jpg exists)
  return res.status(200).send("NO IMAGE");
});

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("ESP32-CAM SERVER OK");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Camera server running on port", PORT);
});
