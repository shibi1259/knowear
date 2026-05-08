const mongoose = require('mongoose')

const seoDetails = mongoose.Schema({
    page: { type: String, required: true, enum: ['Home', 'About', 'Contact', 'Stores', 'FAQs', 'Terms-And-Conditions', 'Privacy-And-Policy'] },
    url: { type: String, required: true },
    keywords: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
    title: { type: String, default: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('seo.details', seoDetails)
