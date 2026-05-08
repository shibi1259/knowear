const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    areanumber: { type: String },
    countryCode: { type: String, default: '+971' },
    mobile: { type: String },
    type: { type: String, enum: ['Home', 'Work', 'Others'] },
    companyName: { type: String },
    aptSuiteUnit: { type: String },
    streetAddress: { type: String },
    deliveryAddress: { type: String },
    additionalAddress: { type: String },
    city: { type: String },
    postalCode: { type: String },
    state: { type: String },
    country: { type: String },
    countryName: { type: String,default:"United Arab Emirates" },
    email: { type: String },
    coordinates: {
        latitude: { type: String },
        longitude: { type: String },
    },
    refid: { type: String, required: true },
    deliveryInstruction: { type: String },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    isDelete: { type: Boolean, default: false },
    isDefaultShipping: { type: Boolean, default: false },
    isDefaultBilling: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('address', addressSchema);