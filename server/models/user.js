const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Group = require('./group');

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
    // Hash the password before saving into db
    bcrypt.hash(user.password, saltRounds=10, function(err, hash) {
        if(err) {
            throw new Error('Password hashing failed.');
        } else {
            user.password = hash;

            // Create personal group for user
            Group.create({
                name: 'Personal',
                members: user._id
            }, function(err, personalGroup) {
                if(err) {
                    throw new Error(`Default personal group couldn't be created for user ${user.name}`);
                }
                console.log(`Default personal group ${personalGroup._id} created for user `)
                next();
            })
        }
      });
})

// checking if password is valid
UserSchema.methods.isValidPassword = function(password, cb) {
    const user = this;
    bcrypt.compare(password, user.password, function(err, res) {
        if (err) return cb(err);
        return cb(null, res);
    });
};

module.exports = mongoose.model('UserModel', UserSchema);