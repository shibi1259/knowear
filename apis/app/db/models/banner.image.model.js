const mongoose = require("mongoose")

const banner = mongoose.Schema({
    title: { type: String },
    redirection: { type: String },
    refid: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['cart-mobile', 'cart-web', 'productdetails-mobile', 'productdetails-web'] },
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'medias', required: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users', required: true },
}, { timestamps: true })

module.exports = mongoose.model('banner.images', banner)