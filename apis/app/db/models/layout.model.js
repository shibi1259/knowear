const mongoose = require("mongoose")

const homeSectionSchema = mongoose.Schema({
    title: { type: String },
    type: { type: String },
    slug: { type: String },
    layid: { type: String, required: true },
    gridCount: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    validFrom: { type: Date, default: (new Date().toDateString()) },
    validTo: { type: Date, default: (new Date().toDateString()), },
    files: [
        {
            id: { type: Number },
            file: { type: String },
            redirect: { type: String },
        }
    ],
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
})

module.exports = mongoose.model('layouts', homeSectionSchema) 