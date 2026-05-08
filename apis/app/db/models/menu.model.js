const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({
    title: { type: String, required: true },
    icon: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
    menuType: { type: String, required: true, enum: ['category', 'staticpages', 'searchfilters', 'product', 'collection', 'brand', 'cmspages'] },
    redirection: { type: String, required: true },
    refid: { type: String, required: true },
    index: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' }
}, { timestamps: true })

module.exports = mongoose.model('menus', menuSchema)