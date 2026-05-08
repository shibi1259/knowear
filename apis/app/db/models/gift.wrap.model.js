const mongoose = require('mongoose');

const giftSchema = mongoose.Schema({
    isEnabled: { type: Boolean, default: false },
    isOrderLevel: { type: Boolean, default: false },
    minimumValue: { type: Number, default: 1 },
    giftCharge: { type: Number, default: 5 },
    slug: { type: String, default: 'gift-wrap' },
}, { timestamps: true })

module.exports = mongoose.model('gifts.wraps', giftSchema);