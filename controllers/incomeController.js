const XLSX = require('xlsx');
const Income = require('../models/Income');


// add income controller functions here
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, source, amount, date } = req.body;

        if (!source || !amount || !date) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        
        const income = new Income({
            userid: req.user.id,
            icon,
            source,
            amount,
            date: new Date(date),
        });

        await income.save();
        res.status(201).json({ message: 'Income added successfully', income });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// get all incomes for a user
exports.getAllIncomes = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({ userid: userId }).sort({ date: -1 });
        res.status(200).json(income);
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// delete an income by id
exports.deleteIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        await Income.findOneAndDelete({ _id: req.params.id, userid: userId });
        res.status(200).json({ message: 'Income deleted successfully' });
    }catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// download all incomes as excel file
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({ userid: userId }).sort({ date: -1 });

        // prepare data for excel
        const data = income.map(item => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date.toISOString().split('T')[0],
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Incomes');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        XLSX.writeFile(wb, 'incomes_details.xlsx');
        res.download('incomes_details.xlsx'); 

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};