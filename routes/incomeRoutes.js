const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { addIncome, getAllIncome, deleteIncome, downloadExcel } = require("../controllers/incomeController");

router.use(verifyToken);
router.post("/add", addIncome);
router.get("/getAll", getAllIncome);
router.delete("/delete/:id", deleteIncome);
router.get("/downloadExcel", downloadExcel);

module.exports = router;
