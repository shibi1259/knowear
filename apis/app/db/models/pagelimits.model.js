const mongoose = require("mongoose");

const limitsSchema = mongoose.Schema(
   {
      slug: { type: String, required: true },
      brands: {
         pagelimit: { type: Number, default: 25 },
         selecteditem: { type: mongoose.Schema.Types.ObjectId, ref: 'brands' }
      },
      collections: {
         pagelimit: { type: Number, default: 25 },
         selecteditem: { type: mongoose.Schema.Types.ObjectId, ref: 'collections' }
      },
      products: {
         pagelimit: { type: Number, default: 25 },
         selecteditem: { type: mongoose.Schema.Types.ObjectId, ref: 'products' }
      },
      categories: {
         pagelimit: { type: Number, default: 25 },
         selecteditem: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
      },
      isActive: { type: Boolean, default: true },
      isDelete: { type: Boolean, default: false }
   },
   { timestamps: true, }
);

module.exports = mongoose.model("pagelimits", limitsSchema);
