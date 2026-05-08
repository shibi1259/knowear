const mongoose = require('mongoose');

const paymentDetailsSchema = mongoose.Schema({
    paymentGateway: {
        type: String, required: true, default: 'razorpay', enum: [
            'razorpay', 'tabby', 'postpay', 'paytabs',
            'tap', 'paytm', 'paypal', 'stripe', 'rakbank', 'network'
        ]
    },
    displayName: { type: String },
    displayIcon: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
    isEnabled: { type: Boolean, default: false },
    merchantId: { type: String },
    merchantCode: { type: String },
    secretKey: { type: String },
    publicKey: { type: String },
    privateKey: { type: String },
    serverKey: { type: String },
    profileId: { type: String },
    region: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'admin.users' },
}, { timestamps: true });

module.exports = mongoose.model('payment.details', paymentDetailsSchema);