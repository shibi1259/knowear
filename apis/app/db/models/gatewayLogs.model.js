const mongoose = require('mongoose');

const shippingGatewayLogsScehma = mongoose.Schema({
    status:{ type: String, enum: ['success','pending', 'failed'], default: 'pending' },
    type: { type: String,enum:["request", "response"], default:"request"}, 
    shipmentType: { type: String,enum:["rates", "shipping", "tracks", "pickup" ], required:true},
    request: { type: mongoose.Schema.Types.Mixed },
    response: { type: mongoose.Schema.Types.Mixed },
    referenceKey: { type: String }, // payment gateway reference for admin to use . 
    error : {type:String},
    orderNo : { type: String },
    adminEmail: {type:String},
}, { timestamps: true })

module.exports = mongoose.model('shippingGatewayLogs', shippingGatewayLogsScehma);