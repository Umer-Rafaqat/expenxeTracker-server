require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

console.log("=== ENV CHECK ===");
console.log("MONGO_URI:", JSON.stringify(process.env.MONGO_URI));
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");
console.log("PORT:", process.env.PORT);
console.log("=================");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "http://localhost:3000", // Alternative local port
  "https://expense-tracker-client-ten-psi.vercel.app", // Production Vercel
  process.env.CLIENT_ORIGIN, // Any additional origin from env
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Health check
app.get("/", (req, res) =>
  res.json({ success: true, message: "Expense Tracker API running" }),
);

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
