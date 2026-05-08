const mongoose = require("mongoose");

const taxRuleSchema = mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  rate: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false },
  createdBy: { type: mongoose.Types.ObjectId, ref: "admin.users" },
}, { timestamps: true });

module.exports = mongoose.model("tax.rules", taxRuleSchema);
