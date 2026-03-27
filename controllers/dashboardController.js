const Income = require("../models/Income");
const Expense = require("../models/Expense");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Totals
    const [allIncome, allExpenses] = await Promise.all([
      Income.find({ userId }),
      Expense.find({ userId }),
    ]);

    const totalIncome = allIncome.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = allExpenses.reduce((s, e) => s + e.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    // Last 60 days income grouped by date
    const recentIncome = await Income.find({ userId, date: { $gte: sixtyDaysAgo } }).sort({ date: 1 });
    const incomeByDate = groupByDate(recentIncome);

    // Last 30 days expenses grouped by date
    const recentExpenses = await Expense.find({ userId, date: { $gte: thirtyDaysAgo } }).sort({ date: 1 });
    const expensesByDate = groupByDate(recentExpenses);

    // Expense breakdown by category
    const expenseByCategory = allExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    const categoryBreakdown = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

    // Recent transactions (last 5 income + last 5 expense, merged & sorted)
    const last5Income = await Income.find({ userId }).sort({ date: -1 }).limit(5);
    const last5Expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(5);

    const recentTransactions = [
      ...last5Income.map((i) => ({ ...i.toObject(), type: "income" })),
      ...last5Expenses.map((e) => ({ ...e.toObject(), type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        totalBalance,
        totalIncome,
        totalExpenses,
        incomeByDate,
        expensesByDate,
        categoryBreakdown,
        recentTransactions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function groupByDate(records) {
  const map = {};
  records.forEach((r) => {
    const key = new Date(r.date).toISOString().split("T")[0];
    map[key] = (map[key] || 0) + r.amount;
  });
  return Object.entries(map).map(([date, amount]) => ({ date, amount }));
}
