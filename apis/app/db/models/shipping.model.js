const mongoose = require('mongoose')

const shippingSchema = mongoose.Schema({
    cost: { type: String, required: true, enum: ['highest', 'city', 'lowest', 'minimum', 'total', 'free'] },
    amount: { type: String, default: '499' },
    charge: { type: String, default: '10' },
    refid: { type: String, default: '1' },
    country: { type: String, enum: ['UAE', 'India'], default: 'UAE' },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users', required: true },
}, { timestamps: true })

module.exports = mongoose.model('shipping.details', shippingSchema)
