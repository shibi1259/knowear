const mongoose = require("mongoose")

const catalog = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    slug: { type: String, required: true },
    seoTitle: { type: String },
    seoKeywords: { type: String },
    seoDescription: { type: String },
    canonicalUrl: { type: String },
    isDraft: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('catalogs', catalog)