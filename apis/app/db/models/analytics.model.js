const mongoose = require("mongoose");

const analyticsSchema = mongoose.Schema({
    isAnalyticsEnabled: { type: Boolean, default: false },
    analyticsId: { type: String },
    isTagEnabled: { type: Boolean, default: false },
    tagId: { type: String },
    isPixelEnabled: { type: Boolean, default: true },
    pixelId: { type: String },
    refid: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true })

module.exports = mongoose.model("analytics", analyticsSchema);