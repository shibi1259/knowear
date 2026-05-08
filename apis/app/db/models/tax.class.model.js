const mongoose = require("mongoose");

const taxClassSchema = mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  rules: [{ type: mongoose.Types.ObjectId, ref: 'tax.rules' }],
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false },
  createdBy: { type: mongoose.Types.ObjectId, ref: "admin.users" },
}, { timestamps: true });

module.exports = mongoose.model("tax.classes", taxClassSchema);
