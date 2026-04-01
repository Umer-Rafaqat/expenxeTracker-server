const Income = require("../models/Income");
const ExcelJS = require("exceljs");

exports.addIncome = async (req, res) => {
  try {
    const { icon, source, amount, date, description } = req.body;
    if (!source || !amount || !date)
      return res.status(400).json({ success: false, message: "Source, amount, and date are required" });

    const income = await Income.create({ userId: req.user.id, icon, source, amount, date, description });
    res.status(201).json({ success: true, message: "Income added", data: income });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, data: incomes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!income) return res.status(404).json({ success: false, message: "Income not found" });
    res.json({ success: true, message: "Income deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadExcel = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Income");

    sheet.columns = [
      { header: "Source", key: "source", width: 25 },
      { header: "Amount (PKR)", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 20 },
      { header: "Description", key: "description", width: 35 },
    ];

    sheet.getRow(1).font = { bold: true };
    incomes.forEach((inc) => {
      sheet.addRow({
        source: inc.source,
        amount: inc.amount,
        date: new Date(inc.date).toLocaleDateString(),
        description: inc.description,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=income.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
