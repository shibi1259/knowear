const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  overview: { type: String }, //excerpt field in csv file 
  stock: { type: Number, default: 0 },
  moq: { type: Number, default: 1 },
  maxOrderQuantity: { type: Number, default: 10 },
  offerExists: { type: Boolean, default: true },
  attributes: [{
    type: { type: String },
    title: { type: String },
    value: { type: String }
  }],
  category: [{ type: mongoose.Types.ObjectId, ref: "categories" }],
  product: { type: mongoose.Types.ObjectId, ref: "products.heads" },
  parentId: { type: mongoose.Types.ObjectId, ref: "products.heads" },
  price: {
    mrp: { type: Number, required: true },
    offer: { type: Number, required: true },
    production: { type: Number, required: true },
    selling: { type: Number }
  },
  donationPercentage: { type: Number, default: 0 },
  details: {
    description: { type: String },
    sizeChart: { type: String },
    returnPolicy: { type: String }
  },

  offers: [{
    title: { type: String },
    slug: { type: String },
    priority: { type: Number },
    offerType: { type: String, enum: ['percentage', 'fixed'] },
    offerAmount: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
  }],

  collections: [{
    name: { type: String },
    slug: { type: String },
    thumbnail: { type: String },
    cover: { type: String },
  }],

  searchKeywords: [{ type: String }],
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
  files: [{ type: String }],
  thumbnail: { type: String },
  hoverThumbnail: { type: String },
  video: { type: String },
  metaKeywords: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  ogImage: { type: String },
  xTag: { type: String },
  canonicalUrl: { type: String },

  rating: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false },
  createdBy: { type: mongoose.Types.ObjectId, ref: "admin.users" },
}, { timestamps: true });

module.exports = mongoose.model("products", productSchema);


