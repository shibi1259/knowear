const mongoose = require("mongoose")

const footerSchema = mongoose.Schema({
    shopTitle: { type: String, default: 'SHOP' },
    communityTitle: { type: String, default: 'OUR COMMUNITY' },
    customerSupportTitle: { type: String, default: 'CUSTOMER SUPPORT' },
    newsletterTitle: { type: String, default: '' },
    callUsTitle: { type: String, default: '' },
    callUsValue: { type: String, default: '' },
    emailTitle: { type: String, default: '' },
    emailUsValue: { type: String, default: '' },
    shopLinks: [{
        title: { type: String },
        link: { type: String }
    }],
    communityLinks: [{
        title: { type: String },
        link: { type: String }
    }],
    customerSupportLinks: [{
        title: { type: String },
        link: { type: String }
    }],
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('footer', footerSchema)