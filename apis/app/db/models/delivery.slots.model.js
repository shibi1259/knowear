const mongoose = require("mongoose");

const deliverySlots = mongoose.Schema({
    day: { type: String, required: true, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    from: { type: String, required: true },
    to: { type: String, required: true },
    ordersPerSlot: { type: Number, default: 100 },
    refid: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Types.ObjectId, ref: "admin.users" },
}, { timestamps: true });

module.exports = mongoose.model("delivery.slots", deliverySlots);
