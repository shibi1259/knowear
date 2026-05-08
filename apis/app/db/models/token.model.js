const mongoose = require('mongoose')

const tokenSchema = mongoose.Schema({
    deviceToken: { type: String, required: true },
    tokens: [{ type: String, required: true }],
    refid: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
})

module.exports = mongoose.model('tokens', tokenSchema)