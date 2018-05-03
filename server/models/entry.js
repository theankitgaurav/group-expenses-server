const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    details: { type: String, trim: true },
    enteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    },
    forDate: {type: Date, default: Date.now, required: true },
    forUser: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true},
    quantity: Number,
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
     },
}, { timestamps: { createdAt: 'createdAt', updatedAt: "updatedAt" } });

module.exports = mongoose.model('EntryModel', EntrySchema);