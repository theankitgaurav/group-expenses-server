const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    details: { type: String, trim: true },
    enteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    forDate: {type: Date, default: Date.now, required: true },
    forUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantity: Number,
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
     },
}, { timestamps: { createdAt: 'createdAt', updatedAt: "updatedAt" } });

module.exports = mongoose.model('EntryModel', EntrySchema);