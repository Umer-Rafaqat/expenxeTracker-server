const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { addExpense, getAllExpenses, deleteExpense, downloadExcel } = require("../controllers/expenseController");

router.use(verifyToken);
router.post("/add", addExpense);
router.get("/getAll", getAllExpenses);
router.delete("/delete/:id", deleteExpense);
router.get("/downloadExcel", downloadExcel);

module.exports = router;
