const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  customers: [{ type: mongoose.Types.ObjectId, ref: "customers" }],
  title: { type: String, required: true },
  content: { type: String },
  channel: { type: String, required: true, enum: ['sms', 'email', 'push', 'app'] },
  type: { type: String, required: true, required: ['instant', 'scheduled'], default: 'instant' },
  scheduledDate: { type: Date },
  scheduledTime: { type: String },
  redirection: { type: String },
  status: { type: String, required: true, enum: ["pending", "sent", "rejected", "failed"], default: "pending" },
  thumbnail: { type: mongoose.Types.ObjectId, ref: "medias" },
  isStoreLevel: { type: Boolean, default: false }, // Send notification to all active users of the store
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("notifications", notificationSchema);
