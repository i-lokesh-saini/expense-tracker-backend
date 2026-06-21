const moongoose = require('mongoose');

const incomeSchema = new moongoose.Schema({
    userid: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    icon:{
        type: String,
    },
    source:{
        type: String,
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now,
    },
},{timestamps: true});

module.exports = moongoose.model('Income', incomeSchema);