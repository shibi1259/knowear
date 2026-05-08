const mongoose = require("mongoose");

const productEnquirySchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    countryCode: { type: String, required: true },
    country: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String, required: true },
    city: { type: String, required: true },
    status: { type: String, default: "Enquired", enum: ["Enquired", "Responded"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product.enquiries", productEnquirySchema);
