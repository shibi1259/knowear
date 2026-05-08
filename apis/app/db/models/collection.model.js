const mongoose = require("mongoose");

const collectionSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true },
  thumbnail: { type: String },
  cover: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
  canonical: { type: String },
  ogImage: { type: String },
  xCard: { type: String },
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false },
}, { timestamps: true, });

module.exports = mongoose.model("collections", collectionSchema);

