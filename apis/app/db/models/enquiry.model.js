const mongoose = require('mongoose')

const enquiry = mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('enquiries', enquiry);