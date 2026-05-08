const mongoose = require("mongoose")

const mailerSchema = mongoose.Schema({
    orderTransactions: [{ type: String }],
    cancelledOrders: [{ type: String }],
    dailyReports: [{ type: String }],
    abandonedCarts: [{ type: String }],
    subscribers: [{ type: String }],
    newsletters: [{ type: String }],
    refid: { type: String, default: '1' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' }
}, { timestamps: true })

module.exports = mongoose.model('mailer.subscriptions', mailerSchema)