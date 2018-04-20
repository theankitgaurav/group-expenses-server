const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: String,
    details: { type: String, trim: true },
    enteredBy: mongoose.Schema.Types.ObjectId,
    entryDate: { type: Date, default: Date.now },
    forDate: {type: Date, default: Date.now },
    forUser: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    updatedBy: mongoose.Schema.Types.ObjectId,
    updateDate: { type: Date, default: Date.now }
});

// entrySchema.pre('save', function(next) {
//     // const user = this;
//     // user.password = passwordHash.generate(user.password);
//     // next();
// })

// checking if password is valid
// entrySchema.methods.isValidPassword = function(password) {
//     return (passwordHash.verify(password, this.password));
// };

module.exports = mongoose.model('entryModel', entrySchema);