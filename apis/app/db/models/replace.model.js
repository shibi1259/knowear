const mongoose = require('mongoose');

const replaceSchema = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'orders', required: true },
    refundedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    quantity: { type: String, default: '1' },
    reason: { type: String, required: true },
    comments: { type: String },
    images: [{ type: String }],
    note: { type: String },
    status: { type: String, default: ['requested', 'initiated', 'replaced', 'rejected'], default: 'requested' },
    refid: { type: String, required: true },
    reference: { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('order.replaces', replaceSchema);

