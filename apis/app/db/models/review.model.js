const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    order: {
        id: { type: mongoose.Types.ObjectId, ref: 'orders', required: true },
        refid: { type: String, required: true }
    },
    product: {
        id: { type: mongoose.Types.ObjectId, ref: 'products' },
        refid: { type: String, required: true },
    },
    customer: {
        id: { type: mongoose.Types.ObjectId, ref: 'customers', required: true },
        refid: { type: String, required: true },
    },
    files: [{ type: String }],
    refid: { type: String, required: true },
    rating: { type: String, required: true },
    title: { type: String },
    message: { type: String, required: true },
    created: { type: Date, default: (new Date().toISOString()) },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('reviews', reviewSchema);