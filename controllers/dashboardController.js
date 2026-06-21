const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { isValidObjectId , Types } = require('mongoose');


//  Dashboard Data
exports.getDashboardData = async (req, res) => {
    try {
        const userid = req.user._id;
        const userObjectId = new Types.ObjectId(String(userid));

        // Fetch total income and expenses for the user
        const totalIncome = await Income.aggregate([
            { $match: { userid: userObjectId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // console.log('Total Income:', {totalIncome , userid: isValidObjectId(userid)});

        const totalExpenses = await Expense.aggregate([
            { $match: { userid: userObjectId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // get income transactions in the last 60 days
        const last60DaysIncomeTransactions = await Income.find({
            userid,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        // get total income for last 60 days
        const totalIncomeLast60Days = last60DaysIncomeTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        // get all expense transactions in the last 30 days
        const last30DaysExpenseTransactions = await Expense.find({
            userid,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        // get total expenses for last 30 days
        const expensesLast30Days = last30DaysExpenseTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        // fetch recent 5  transactions income and expenses
        const lastTransactions = [
            ...(await Income.find({ userid }).sort({ date: -1 }).limit(5)).map(
                (transaction) => ({
                ...transaction.toObject(),
                type: 'income',
                }),
            ),
            ...(await Expense.find({ userid }).sort({ date: -1 }).limit(5)).map(
                (transaction) => ({
                ...transaction.toObject(),
                type: 'expense',
                }),
            ),
        ].sort((a, b) => b.date - a.date);

        // finally send the response
        res.json({
            totalBalance: 
                (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
            totalIncome:  totalIncome[0]?.total || 0,
            totalExpenses: totalExpenses[0]?.total || 0,
            last30daysExpenses: {
                total: expensesLast30Days,
                transactions: last30DaysExpenseTransactions,
            },
            last60daysIncome: {
                total: totalIncomeLast60Days,
                transactions: last60DaysIncomeTransactions,
            },
            recentTransactions: lastTransactions,
        });

        // res.json({
        //     "recentTransactions": lastTransactions,
        //     "last30DaysExpenses": last30DaysExpenseTransactions,
        //     "last60DaysIncome": last60DaysIncomeTransactions,
        // });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Server error' });
    }
}