const mongoose = require('mongoose');

const returnSchema = mongoose.Schema({
   order: { type: mongoose.Schema.Types.ObjectId, ref: 'orders', required: true },
   product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
   quantity: { type: String, default: '1' },
   returnAmount: { type: Number, required: true },
   reason: { type: String, required: true },
   comments: { type: String },
   images: [{ type: String }],
   isRefunded: { type: Boolean, default: false },
   reference: { type: String, required: true },
   refid: { type: String, required: true },
   isAccepted: { type: Boolean, default: false },
   isRejected: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('order.returns', returnSchema);   