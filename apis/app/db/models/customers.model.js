const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true },
    areanumber: { type: String },
    password: { type: String },
    countryCode: { type: String, default: '+971' },
    countryName: { type: String },
    mobile: { type: String },
    deviceTokens: [{ type: String }],
    userid: { type: String, required: true },
    avatar: { type: String },
    registerMethod: { type: String, enum: ['Facebook', 'Google', 'Email', 'Apple', 'Admin'], default: 'Email' },
    coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'coupons' }],
    wishlist: [{ type: mongoose.Types.ObjectId, ref: 'products' }],
    searchHistory: [{ type: String }],
    otp: {
        mobile: { type: String },
        email: { type: String }
    },
    verificationToken: {
        email: { type: String },
        mobile: { type: String }
    },
    referer: { type: String },
    isActive: { type: Boolean, default: true },
    loginTime: { type: Date },
    logoutTime: { type: Date },
    isDelete: { type: Boolean, default: false },
}, { timestamps: true });


module.exports = mongoose.model('customers', customerSchema);
