const mongoose = require('mongoose');
const passwordHash = require('password-hash');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true
    },
    name: String,
    password: {
        type: String,
        trim: true,
        required: true
    }
});

UserSchema.pre('save', function(next) {
    const user = this;
    user.password = passwordHash.generate(user.password);
    next();
})

// checking if password is valid
UserSchema.methods.isValidPassword = function(password) {
    return (passwordHash.verify(password, this.password));
};

module.exports = mongoose.model('UserModel', UserSchema);