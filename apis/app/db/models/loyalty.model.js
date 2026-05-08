const mongoose = require("mongoose")

const loyaltySchema = mongoose.Schema({
    earning: {
        amount: { type: String, required: true },
        points: { type: String, required: true },
    },
    conversion: {
        points: { type: String, required: true },
        worth: { type: String, required: true },
    },
    welcomePoints: { type: String, default: '1' },
    minimumPurchase: { type: String, required: true },
    percentageOff: { type: String, required: true },
    maximumPoints: { type: String, required: true },
    slug: { type: String, default: 'loyalty-points' },
    isEnabled: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' }
}, { timestamps: true })

module.exports = mongoose.model('loyalty', loyaltySchema)