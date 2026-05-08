const mongoose = require("mongoose");

const generalSchema = mongoose.Schema(
   {
      currency: { type: String, default: 'AED' },
      isOutOfStock: { type: Boolean, default: false },
      isNotifyStock: { type: Boolean, default: false },
      name: { type: String, required: true },
      description: { type: String, required: true },
      domain: { type: String, required: true },
      dashboard: { type: String },
      primaryAddress: { type: String, required: true },
      logo: { type: String },
      favicon: { type: String },
      defaultImage: { type: String },
      isOnlinePayment: { type: Boolean, default: true },
      isCashOnDelivery: { type: Boolean, default: true },
      isStoreLive: { type: Boolean, default: true },
      headerTexts: [{
         text: { type: String },
         link: { type: String },
      }],
      seoSection: {
         title: { type: String },
         description: { type: String },
         keywords: { type: String },
         image: { type: String },
         canonical: { type: String },
         xCard: { type: String }
      }
   }, { timestamps: true, }
);

module.exports = mongoose.model("general.settings", generalSchema);
