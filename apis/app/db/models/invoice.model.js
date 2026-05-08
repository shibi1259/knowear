const mongoose = require("mongoose")

const invoiceSchema = mongoose.Schema({
    code: { type: String },
    startingRange: { type: String },
    slug: { type: String },
    refid: { type: String },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
})

module.exports = mongoose.model('invoice.settings', invoiceSchema)