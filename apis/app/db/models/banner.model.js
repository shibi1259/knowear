const mongoose = require("mongoose")

const banner = mongoose.Schema({
    title: { type: String, required: true },
    refid: { type: String, required: true },
    type: { type: String, required: true, enum: ["1", "2", "3", "4"] },
    files: [{
        file: { type: String, required: true },
        mobileFile: { type: String },
        redirection: { type: String },
        title: { type: String },
    }],
    slides: { type: String, enum: ["1", "2", "3", "4"], default: "1" },
    heightConstraint: { type: String, enum: ["custom", "slider"] },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('banners', banner)