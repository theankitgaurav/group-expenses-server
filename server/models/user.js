const mongoose = require('mongoose');
const User = new mongoose.Schema({
    username: String,
    name: String,
    password: String
});

module.exports = mongoose.model('UserModel', User);