const Expense = require("../models/Expense");
const ExcelJS = require("exceljs");

exports.addExpense = async (req, res) => {
  try {
    const { icon, category, amount, date, description } = req.body;
    if (!category || !amount || !date)
      return res.status(400).json({ success: false, message: "Category, amount, and date are required" });

    const expense = await Expense.create({ userId: req.user.id, icon, category, amount, date, description });
    res.status(201).json({ success: true, message: "Expense added", data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadExcel = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Expenses");

    sheet.columns = [
      { header: "Category", key: "category", width: 25 },
      { header: "Amount (PKR)", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 20 },
      { header: "Description", key: "description", width: 35 },
    ];

    sheet.getRow(1).font = { bold: true };
    expenses.forEach((exp) => {
      sheet.addRow({
        category: exp.category,
        amount: exp.amount,
        date: new Date(exp.date).toLocaleDateString(),
        description: exp.description,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
