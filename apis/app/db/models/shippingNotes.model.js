const mongoose = require('mongoose');

const shippingNoteSchema = mongoose.Schema({
    isEnabled: { type: Boolean, default: true },
    note: { type: String, default: '' },
    isMandatory: { type: Boolean, default: false },
    slug: { type: String, default: 'shipping-note' },
    cartId: { type: mongoose.Types.ObjectId, ref: 'cart', required: true },
}, { timestamps: true });

module.exports = mongoose.model('shipping.notes', shippingNoteSchema);
