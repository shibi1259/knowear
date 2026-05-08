const mongoose = require('mongoose')

const webMenuSchema = mongoose.Schema({
    title: { type: String },
    thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
    redirection: { type: String },
    index: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'website.menus' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' }
}, { timestamps: true })

module.exports = mongoose.model('website.menus', webMenuSchema)