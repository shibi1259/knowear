const mongoose = require('mongoose')

const subscriberSchema = mongoose.Schema({
    email: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isUnsubscribed: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('newsletter.subscribers', subscriberSchema)