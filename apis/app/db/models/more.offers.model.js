const mongoose = require('mongoose');

const moreOffersSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    slug: { type: String, required: true },
    thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
    type: { type: String, required: true, enum: ['percentage', 'fixed'] },
    value: { type: Number, default: 0 },
    appliedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    appliedCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    appliedBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'brands' },
    appliedType: { type: String, required: true, enum: ['product', 'category', 'brand'] },
    applicableProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    applicableCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    applicableBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'brands' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admins' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('more.offers', moreOffersSchema);

