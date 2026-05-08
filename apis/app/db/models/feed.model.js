const mongoose = require('mongoose');

const feedSchema = mongoose.Schema({
    refid: { type: String, required: true },
    isGoogleFeed: { type: String, required: true },
    isFacebookFeed: { type: String, required: true },
    googleFeedUrl: { type: String, required: true },
    facebookXmlFeedUrl: { type: String, required: true },
    facebookCsvFeedUrl: { type: String, required: true },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('feeds', feedSchema);