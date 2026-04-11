const express = require("express"); 
const multer = require("multer"); 
const fs = require("fs"); 
const app = express(); 
const upload = multer({ dest: "uploads/" }); 
// Receive snapshot from ESP32 
app.post("/upload", upload.single("image"), (req, res) => { 
  fs.renameSync(req.file.path, "latest.jpg"); res.send("OK");
}); 
// Serve latest snapshot 
app.get("/latest.jpg", (req, res) => { 
  res.sendFile(__dirname + "/latest.jpg");
}); 
app.listen(3000, () => console.log("Camera server running"));
