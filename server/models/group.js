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
    entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EntryModel' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' }]
}, { timestamps: { createdAt: 'createdAt', updatedAt: "updatedAt" } });

// Add a user to a group
GroupSchema.methods.addUser = function(userId) {
    if(this.members.indexOf(userId) == -1) {
        this.members.push(userId);
        console.log(`User id: ${userId} added as a member of group: ${this.name}`);
    } else {
        console.log(`User id: ${userId} already exists as a member of group: ${this.name}`);
        throw new Error(`User id: ${userId} already exists as a member of group: ${this.name}`);
    }
};

// Add a new entry in a group
GroupSchema.methods.addEntry = function (entryId) {
    if (this.entries.indexOf(entryId) != -1) {
        console.error(`Entry with id: ${entryId} already exists in Group: ${this.name}`);
        throw new Error(`Entry with id: ${entryId} already exists in Group: ${this.name}`);
    } else {
        this.entries.push(entryId);
        console.log(`Entry with id: ${entryId} added successfully in Group: ${this.name}`);
    }
};

module.exports = mongoose.model('GroupModel', GroupSchema);