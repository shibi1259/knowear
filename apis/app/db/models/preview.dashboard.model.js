const mongoose = require("mongoose")

const dashboardSchema = mongoose.Schema({
    dashboard: { type: String, required: true },
    refid: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
})

module.exports = mongoose.model('preview.dashboard', dashboardSchema)