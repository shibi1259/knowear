const mongoose = require("mongoose")

const socialSchema = mongoose.Schema({
    facebook: { type: String },
    whatsapp: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
    twitter: { type: String },
    behance: { type: String },
    tiktok: { type: String },
    appStore: { type: String },
    googlePlay: { type: String },
    snapchat: { type: String },
    refid: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
})

module.exports = mongoose.model('social', socialSchema)