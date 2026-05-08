const mongoose = require("mongoose");

const attributeSchema = mongoose.Schema({
    parent: { type: mongoose.Types.ObjectId, ref: "product.heads", required: true },
    product: { type: mongoose.Types.ObjectId, ref: "products", required: true },
    attribute: { type: mongoose.Types.ObjectId, ref: "attributes.heads", required: true },
    value: { type: mongoose.Types.ObjectId, ref: "attributes.values", required: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: "admin.users" },
}, { timestamps: true })

module.exports = mongoose.model("products.attributes", attributeSchema);  