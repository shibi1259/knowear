const mongoose = require('mongoose')

const faqSchema = mongoose.Schema({
    subject: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    seoSection: {
         title: { type: String },
         description: { type: String },
         keywords: { type: String },
         image: { type: String },
         canonical: { type: String },
         xCard: { type: String }
    },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('faq', faqSchema);