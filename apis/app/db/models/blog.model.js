const mongoose = require('mongoose');

const blog = mongoose.Schema({
    thumbnail: { type: mongoose.Types.ObjectId, ref: 'medias', required: true },
    cover: { type: mongoose.Types.ObjectId, ref: 'medias', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    overview: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: String },
    canonicalUrl: { type: String },
    ogImage: { type: String },
    twitterCard: { type: String },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true });

module.exports = mongoose.model('blogs', blog);
