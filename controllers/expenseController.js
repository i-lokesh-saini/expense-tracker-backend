const XLSX = require('xlsx');
const Expense = require('../models/Expense');


// add Expense controller functions here
exports.addExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, category, amount, date } = req.body;

        if (!category || !amount || !date) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        
        const expense = new Expense({
            userid: req.user.id,
            icon,
            category,
            amount,
            date: new Date(date),
        });

        await expense.save();
        res.status(201).json({ message: 'Expense added successfully', expense });

    } catch (error) {
        res.status(500).json({ message: 'Server error',error: error.message });
    }
};

// get all Expenses for a user
exports.getAllExpenses = async (req, res) => {
    const userId = req.user.id;

    try {
        const expense = await Expense.find({ userid: userId }).sort({ date: -1 });
        res.status(200).json(expense);
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// delete an Expense by id
exports.deleteExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        await Expense.findOneAndDelete({ _id: req.params.id, userid: userId });
        res.status(200).json({ message: 'Expense deleted successfully' });
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// download all Expenses as excel file
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;

    try {
        const expense = await Expense.find({ userid: userId }).sort({ date: -1 });

        // prepare data for excel
        const data = expense.map(item => ({
            Category: item.category,
            Amount: item.amount,
            Date: item.date.toISOString().split('T')[0],
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        XLSX.writeFile(wb, 'Expenses_details.xlsx');
        res.download('Expenses_details.xlsx'); 

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};