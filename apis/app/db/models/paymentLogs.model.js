const mongoose = require('mongoose');

const paymentGatewayLogSchema = mongoose.Schema({
    status:{ type: String, enum: ['success','pending', 'failed'], default: 'pending' },
    type: { type: String,enum:["request", "response"], default:"request"}, 
    paymentGateway: { type: String,enum:["tamara", "tabby", "network-international" ], required:true},
    request: { type: mongoose.Schema.Types.Mixed },
    response: { type: mongoose.Schema.Types.Mixed },
    referenceKey: { type: String }, // payment gateway reference for admin to use . 
    error : {type:String},
    // orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
    orderNo : { type: String },
    customerName:{type:String},
    customerEmail:{type:String},
    approval : {type:String, enum:["manual", "automated"] , default:"automated"}, // if a payment is approved by admin
    amount : {type:String},
    adminEmail: {type:String},

}, { timestamps: true })

module.exports = mongoose.model('paymentGatewayLogs', paymentGatewayLogSchema);