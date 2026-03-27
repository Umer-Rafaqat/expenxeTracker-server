const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Also allow token via query param for file downloads
  const queryToken = req.query.token;
  if (!authHeader && !queryToken) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = queryToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
