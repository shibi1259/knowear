const mongoose = require('mongoose');

const referralSchema = mongoose.Schema({
    welcomeBonus: { type: Number, required: true },
    referralBonus: { type: Number, required: true },
    minimumUsers: { type: Number, default: 1 },
    minimumPurchase: { type: Number, required: true },
    slug: { type: String, default: 'referral' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin.users' }
}, { timestamps: true })

module.exports = mongoose.model('referrals', referralSchema);   