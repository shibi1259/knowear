const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    map: { type: String },
    formTitle: { type: String },
    formDescription: { type: String },
    offices: [{
        title: { type: String },
        location: { type: String },
        address: { type: String },
        countryCode: { type: String, default: '+971' },
        mobile: { type: String },
        email: { type: String }
    }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('contactDetails', contactSchema);