const mongoose = require('mongoose');

const popupSchema = mongoose.Schema({
    website: { type: mongoose.Types.ObjectId, ref: 'medias' },
    mobile: { type: mongoose.Types.ObjectId, ref: 'medias' },
    app: { type: mongoose.Types.ObjectId, ref: 'medias' },
    appRedirect: { type: String },
    websiteRedirect: { type: String },
    mobileRedirect: { type: String },
    refid: { type: String, default: '1' },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true });

module.exports = mongoose.model('store.popups', popupSchema);