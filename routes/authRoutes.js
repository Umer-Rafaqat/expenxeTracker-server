const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware");
const { register, login, getUser, uploadImage } = require("../controllers/authController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

router.post("/register", register);
router.post("/login", login);
router.get("/getUser", verifyToken, getUser);
router.post("/upload-image", upload.single("image"), uploadImage);

module.exports = router;
