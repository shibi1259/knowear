const mongoose = require("mongoose")

const notifSubscriberSchema = mongoose.Schema({
    refid: { type: String, required: true },
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    product: { type: mongoose.Types.ObjectId, ref: "products", required: true },
    guest: { type: mongoose.Types.ObjectId, ref: "guests" },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('notify.subscribers', notifSubscriberSchema)