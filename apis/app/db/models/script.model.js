const mongoose = require('mongoose');

const scriptSchema = mongoose.Schema({
    script: { type: String, required: true },
    refid: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('scripts', scriptSchema);