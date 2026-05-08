const mongoose = require('mongoose')

const tncSchema = mongoose.Schema({
    description: { type: String },
    slug: { type: String },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
})

module.exports = mongoose.model('termsandcondition', tncSchema)