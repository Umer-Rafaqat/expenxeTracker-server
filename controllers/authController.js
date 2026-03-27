const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, profileImageUrl } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const user = await User.create({ fullName, email, password, profileImageUrl });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created",
      data: { token, user: { id: user._id, fullName: user.fullName, email: user.email, profileImageUrl: user.profileImageUrl } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({
      success: true,
      message: "Login successful",
      data: { token, user: { id: user._id, fullName: user.fullName, email: user.email, profileImageUrl: user.profileImageUrl } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ success: true, data: { imageUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
