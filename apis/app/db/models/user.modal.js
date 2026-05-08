const mongoose = require('mongoose');
const constants = require('../../../config/constants');
const userTypes = constants.userType.userTypes
const defUserType = constants.userType.defUserType
const userSchema = mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String},
    countryCode: {type: String},
    mobile: {type: String},
    userType: {type: String,
        enum: userTypes,
        default: defUserType
    },
    loginStatus: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
    isDelete: {type: Boolean, default: false},
    token: {type: String}
}, {
    timestamps: true
});


module.exports = mongoose.model('users', userSchema);
