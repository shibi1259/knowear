const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
    thumbnail: { type: String },
    cover: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('brands', brandSchema);
