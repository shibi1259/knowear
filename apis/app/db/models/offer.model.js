const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    priority: { type: Number },

    offerCategory: { type: String, enum: ['complete', 'partial'] },
    offerType: { type: String, required: true, enum: ['percentage', 'fixed'] },
    offerAmount: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    file: { type: String },

    products: [{ type: mongoose.Types.ObjectId, ref: 'products' }],
    collections: [{ type: mongoose.Types.ObjectId, ref: 'collections' }],
    categories: [{ type: mongoose.Types.ObjectId, ref: 'categories' }],
    brands: [{ type: mongoose.Types.ObjectId, ref: 'brands' }],

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true })

module.exports = mongoose.model('offers', offerSchema);