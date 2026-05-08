const mongoose = require('mongoose')

const shippingChargeSchema = mongoose.Schema({
    country: { type: String, enum: ['UAE', 'India'], default: 'UAE' },
    charge: { type: Number, default: 0 },
    city: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    isBlacklisted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users', required: true },
}, { timestamps: true })

module.exports = mongoose.model('shipping.charges', shippingChargeSchema)
