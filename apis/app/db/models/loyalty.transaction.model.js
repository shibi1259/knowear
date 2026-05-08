const mongoose = require("mongoose")

const loyaltyTxnSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'customers', required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' },
    points: { type: String, required: true },
    type: { type: String, required: true, enum: ['credit', 'debit'] },
    status: { type: String, required: true, enum: ['pending', 'completed', 'failed', 'expired'] },
    description: { type: String },
    expiry: { type: Date, required: true },
    days: { type: String, required: true },
    refid: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('loyalty.transactions', loyaltyTxnSchema)