const mongoose = require("mongoose")

const mediaSchema = mongoose.Schema({
    title: { type: String, required: true },
    altTitle: { type: String },
    tag: { type: String, enum: ['image', 'video', 'other'], default: 'image' },
    path: { type: String, required: true },
    slug: { type: String, required: true },
    size: { type: String, required: true },
    type: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin.users", required: true },
    uploadedTo: { type: String, default: "assets" },
    uploadedDescription: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('medias', mediaSchema)