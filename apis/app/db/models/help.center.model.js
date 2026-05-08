const mongoose = require('mongoose')

const helpcenterSchema = mongoose.Schema({
    description: { type: String, required: true },
    refid: { type: String, required: true },
    countryCode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    verification: {
        email: { type: String },
        phone: { type: String },
    }
}, { timestamps: true })

module.exports = mongoose.model('helpcenter', helpcenterSchema)