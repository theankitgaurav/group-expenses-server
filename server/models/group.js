const mongoose = require('mongoose');
const _ = require('lodash');
const Entry = require('./entry');
const User = require('./user');

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        trim: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Add a user to a group
GroupSchema.methods.addUser = function(userId) {
    if(this.members.indexOf(userId) == -1) {
        this.members.push(userId);
        console.log(`User id: ${userId} add as a member of group: ${this.name}`);
    }
    console.log(`User id: ${userId} already exists as a member of group: ${this.name}`);
};

module.exports = mongoose.model('GroupModel', GroupSchema);