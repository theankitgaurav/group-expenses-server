const mongoose = require('mongoose');
const passwordHash = require('password-hash');
const bcrypt = require('bcrypt');

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
    bcrypt.compare(password, this.password, function(err, res) {
        if(err) throw new Error('Password comparison failed.')
        return res;
    });
};

module.exports = mongoose.model('UserModel', UserSchema);