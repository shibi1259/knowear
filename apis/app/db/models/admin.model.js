const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    username: { type: String, required: true },
    slug: { type: String, required: true },
    refid: { type: String, required: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String },
    email: { type: String, required: true },
    countryCode: { type: String },
    mobile: { type: String },
    role: { type: mongoose.Types.ObjectId, ref: 'roles' },
    accessTokens: [{ type: String }],
    deviceTokens: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    verificationToken: {
        password: { type: String }
    },
    isPlatformOwner: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('admin.users', adminSchema);