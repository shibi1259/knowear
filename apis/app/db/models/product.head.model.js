const mongoose = require("mongoose");

const productHeadSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique:true },
    sku: { type: String, required: true },
    tax: { type: mongoose.Types.ObjectId, ref: "tax.classes" },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    createdBy: { type: mongoose.Types.ObjectId, ref: "admin.users" },
  }, { timestamps: true });

  productHeadSchema.pre("save", async function (next) {
    if (this.isModified("name") || this.isNew) {
      const timestamp = Date.now();
      this.slug = `${this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${timestamp}`;
    }
    next();
  });

module.exports = mongoose.model("products.heads", productHeadSchema);
