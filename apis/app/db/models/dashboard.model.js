const mongoose = require("mongoose")

const dashboardSchema = mongoose.Schema({
    dashboard: { type: String, required: true },
    items: {
        collections: [{ type: String }],
        brands: [{ type: String }],
        categories: [{ type: String }],
    },
    refid: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('dashboards', dashboardSchema)