const mongoose = require("mongoose")

const couponSchema = mongoose.Schema({
    couponType: { type: String, enum: ['complete', 'partial'] },
    title: { type: String, required: true },
    refid: { type: String, required: true },
    code: { type: String, required: true },
    fromDate: { type: Date, default: (new Date(new Date().setHours(0, 0, 0, 0))).toISOString(), required: true },
    lastDate: { type: Date, default: (new Date(new Date().setHours(23, 59, 59, 59))).toISOString(), required: true },
    type: { type: String, required: true, enum: ['percent', 'amount'] },
    value: { type: String, required: true },
    file: { type: String },
    slug: { type: String, required: true },
    minPurchase: { type: Number, required: true, default: 0 },
    minimumType: { type: String, enum: ['cart', 'individual'], default: 'cart' },
    details: {
        type: { type: String, enum: ['limited', 'unlimited'], default: 'limited' },
        value: { type: Number, default: 1 }
    },
    countPerUser: { type: String },

    products: [{ type: mongoose.Types.ObjectId, ref: 'products' }],
    collections: [{ type: mongoose.Types.ObjectId, ref: 'collections' }],
    categories: [{ type: mongoose.Types.ObjectId, ref: 'categories' }],
    brands: [{ type: mongoose.Types.ObjectId, ref: 'brands' }],

    forUser: { type: mongoose.Types.ObjectId, ref: 'users' },
    style: {
        background: { type: String },
        border: { type: String },
        radius: { type: String },
        text: {
            color: { type: String },
            fontWeight: { type: String },
            fontSize: { type: String },
            font: { type: String },
            fontFamily: { type: String },
            fontStyle: { type: String }
        }
    },
    isVisibility: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('coupons', couponSchema)