const mongoose = require('mongoose');

const sitemapSchema = mongoose.Schema({
    sitemap: { type: String, required: true },
    isEnabled: { type: Boolean, default: false },
    refid: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' }
}, { timestamps: true })

module.exports = mongoose.model('sitemaps', sitemapSchema);   