const mongoose = require("mongoose")

const contentSchema = mongoose.Schema({
    privacyPolicy: { type: String },
    privacyPolicySeoSection: {
         title: { type: String },
         description: { type: String },
         keywords: { type: String },
         image: { type: String },
         canonical: { type: String },
         xCard: { type: String }
    },
    termsAndCondition: { type: String },
    termsAndConditionSeoSection: {
         title: { type: String },
         description: { type: String },
         keywords: { type: String },
         image: { type: String },
         canonical: { type: String },
         xCard: { type: String }
    },
    refundPolicy: { type: String },
    refundPolicySeoSection: {
         title: { type: String },
         description: { type: String },
         keywords: { type: String },
         image: { type: String },
         canonical: { type: String },
         xCard: { type: String }
    },
    shippingPolicySeoSection: {
         title: { type: String },
         description: { type: String },
         keywords: { type: String },
         image: { type: String },
         canonical: { type: String },
         xCard: { type: String }
    },
    cancellationPolicy: { type: String },
    customerSupport: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('contents', contentSchema)