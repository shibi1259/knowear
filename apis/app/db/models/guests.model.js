const mongoose = require('mongoose');

const guestSchema = mongoose.Schema({
    name: { type: String, required: true },
    deviceToken: { type: String, required: true },
    deviceDetails: {
        os: { type: String },
        platform: { type: String },
        type: { type: String }
    },
    tokens: [{ type: String }],
    coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'coupons' }],
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('guests', guestSchema);