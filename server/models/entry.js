const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: String,
    details: { type: String, trim: true },
    enteredBy: mongoose.Schema.Types.ObjectId,
    forDate: {type: Date, default: Date.now },
    forUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantity: Number,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: "updatedAt" } });

module.exports = mongoose.model('EntryModel', EntrySchema);