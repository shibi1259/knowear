const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    order: { type: mongoose.Types.ObjectId, ref: "orders" },
    customer: { type: mongoose.Types.ObjectId, ref: "customers" },
    coupon: { type: mongoose.Types.ObjectId, ref: "coupons" },
    giftWrap: { type: mongoose.Types.ObjectId, ref: "gifts.wraps" },
      shippingnote:{type:mongoose.Types.ObjectId,ref:"shipping.notes",default:null},
    deviceToken: { type: String },
    guest: { type: mongoose.Types.ObjectId, ref: "guests" },
    isBuyNow: { type: Boolean, default: false },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        isFromSearch: { type: Boolean, default: false },
        isFromRecommended: { type: Boolean, default: false },
        shippingValue: {type:Number,default:0}
      },
    ],
    date: {
      added: { type: Date, default: new Date().toISOString() },
      purchased: { type: Date },
    },
    shippingValue: { type:Number,default:0 },
    isPurchased: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isVarified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("carts", cartSchema);
