const mongoose = require("mongoose")

const productReportSchema = mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, ref: 'products' },
    quantity: { type: Number, default: 0 },
    orderId: { type: mongoose.Types.ObjectId, ref: 'orders' },
    orderDate: { type: Date, default: (new Date().toString()) },
    customerId: { type: mongoose.Types.ObjectId, ref: 'customers' },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
})

module.exports = mongoose.model('products.report', productReportSchema);