const mongoose = require('mongoose');

const otpDetailsSchema = mongoose.Schema({

    email: { type: String, required: true },
    countryCode: { type: String, default: '+971' },
    mobile: { type: String },
    otp  : { type: String },
    
}, { timestamps: true });

module.exports = mongoose.model('otpDetailsSchema', otpDetailsSchema);