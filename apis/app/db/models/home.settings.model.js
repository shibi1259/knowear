const mongoose = require("mongoose");

const homeSchema = mongoose.Schema(
   {
      refid: { type: Number, required: true },
      positions: { type: String, required: true },
      isActive: { type: Boolean, default: true },
      isDelete: { type: Boolean, default: false }
   },
   { timestamps: true, }
);

module.exports = mongoose.model("home.settings", homeSchema);
