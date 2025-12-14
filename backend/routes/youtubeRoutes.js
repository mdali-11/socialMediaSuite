import express from "express";
import multer from "multer";
import { uploadVideo } from "../services/upload.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const data = await uploadVideo({ filePath: req.file.path, title, description });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
