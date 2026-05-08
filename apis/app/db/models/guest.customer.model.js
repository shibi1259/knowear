const mongoose = require('mongoose')

const guestCustomerSchema = mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    areanumber: { type: String },
    additionalAddress: { type: String },
    countryName: { type: String },
    deliveryAddress: { type: String },
    email: { type: String},
    token: { type: String, required:true},
    countryCode: { type: String },
    mobile: { type: String, },
    coordinates: {
        latitude: { type: String },
        longitude: { type: String },
    },
    status: { type: String, enum: ['unregistered', 'registered'] ,default: 'registered' },
    isDelete: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('guest.customers', guestCustomerSchema)