const mongoose = require("mongoose")

const customerReportSchema = mongoose.Schema({
    customerId: { type: mongoose.Types.ObjectId, ref: 'customers' },
    orderId: { type: mongoose.Types.ObjectId, ref: 'orders' },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
})

module.exports = mongoose.model('customer.reports', customerReportSchema) 