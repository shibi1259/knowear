const mongoose = require("mongoose")

const orderReportSchema = mongoose.Schema({
    customer: { type: mongoose.Types.ObjectId, ref: 'customers' },
    date: { type: Date, default: (new Date()).toDateString(), },
    status: { type: String },
    order: { type: mongoose.Types.ObjectId, ref: 'orders' },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }

})

module.exports = mongoose.model('order.reports', orderReportSchema)