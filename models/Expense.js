const moonoose = require('mongoose');

const expenseSchema = new moonoose.Schema({
    userid: {
        type: moonoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    icon: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,  
    },
}, { timestamps: true });

module.exports = moonoose.model('Expense', expenseSchema);