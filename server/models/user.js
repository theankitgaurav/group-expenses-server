const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        minlength: 3
    },
    name: String,
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 6
    }
});

UserSchema.pre('save', function(next) {
    const user = this;
    bcrypt.hash(user.password, saltRounds=10, function(err, hash) {
        if(err) {
            throw new Error('Password hashing failed.');
        } else {
            user.password = hash;
            next();
        }
      });
})

// checking if password is valid
UserSchema.methods.isValidPassword = function(password) {
    const user = this;
    return matchPassword(password, user.password);
};

async function matchPassword(plainTextPassword, hash) {
    return await bcrypt.compare(plainTextPassword, hash);
}

module.exports = mongoose.model('UserModel', UserSchema);