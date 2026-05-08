const mongoose = require("mongoose");
const { shippingNotes } = require("..");
const { type } = require("os");

const orderSchema = mongoose.Schema(
  {
    customerType: { type: String, enum: ['guest', 'regd'], default: 'regd' },
    // store: { type: String, required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: "guest.customers" },

    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'coupons' },

    address: {
      firstname: { type: String },
      lastname: { type: String },
      areanumber:{type:String},
      countryCode: { type: String, default: '+971' },
      mobile: { type: String },
      countryName: { type: String },
      type: { type: String, enum: ['Home', 'Work', 'Others'] },
      streetAddress: { type: String },
      deliveryAddress: { type: String },
      additionalAddress: { type: String },
      aptSuiteUnit: { type: String },
      country: { type: String },
      email:{type:String},
      // countryName: { type: String },
      city: { type: String },
      postalCode: { type: String },
      state: { type: String },
      coordinates: {
        latitude: { type: String },
        longitude: { type: String },
      },
      deliveryInstruction: { type: String ,default:""},
    },

    source: { type: String, enum: ['WEB', 'ADMIN', 'APP'], default: 'WEB' },

    products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
      quantity: { type: Number, required: true },
      pricePerUnit: { type: Number, required: true },
      discountTotal: { type: Number },
      mrpTotal: { type: Number },
      baseTotal: { type: Number, required: true },
      taxTotal: { type: Number, required: true },
      total: { type: Number, required: true },
      history: [{
        status: { type: String, default: 'PENDING' },
        date: { type: Date, default: new Date().toISOString() },
        eventCode:{type:String},
        description:{type:String},

      }],
      paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
      shipmentNumber: { type: String },
      shipmentLogs: [{
        apiType: { type: String, enum: ['rates', 'shipments'] },
        request: { type: Object },
        response: { type: Object },
        status: { type: String },
        createdAt: { type: Date, default: Date.now }
      }],
    }],

    invoiceNo: { type: String, required: true },
    orderNo: { type: String, required: true },

    orderStatus: {
      type: String, required: true, default: 'PENDING', enum: [
        'PLACED', 'PENDING', 'ACCEPTED',
        'OUT FOR DELIVERY', 'DELIVERED',
        'CANCELLED', 'FAILED', 'RETURNED', 'ACCEPTED',
        'SHIPPED', 'REFUNDED', 'PARTIAL REFUNDED',
        'PARTIAL PROCESSED', 'PACKED', 'COLLECTED',
        'ORDER REJECTED','ATTEMPTED DELIVERY','PICKUP','ORDER RETURNED'
      ]
    },

    tags: [{ type: String }],

    additionalCharge: { type: Number, default: 0.00 },
    shippingCharge: { type: Number, default: 0.00 },
    subtotal: { type: Number, default: 0.00 },
    discount: { type: Number, default: 0.00 },
    couponDiscount: { type: Number, default: 0.00 },
    tax: { type: Number, default: 0.00 },
    wholeTotal: { type: Number, default: 0.00 },
    priceBeforeTax: { type: Number, default: 0.00 },
    priceAfterTax: { type: Number, default: 0.00 },
    giftWrapTotal: { type: Number, default: 0.00 },
    shippingnotes:{type:String},
    total: { type: Number, default: 0.00 },

    paymentMethod: { type: String, enum: ['ONLINE', "COD", "CARD","network-international"] },
    paymentStatus: { type: String }, //Paid or Pending

    cancel: { reason: { type: String }, date: { type: Date } },

    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },

    orderType: { type: String, enum: ['normal', 'replace', 'return', 'exchange'], default: 'normal' },
    orderReference: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    payment: {
      tamara_order_id: { type: String },
      tamara_checkout_id: { type: String },
      authorizationId: { type: String },
      referenceId: { type: String },
      status: { type: String },
      merchant: { id: { type: String } },
      reference: {
        track: { type: String },
        payment: { type: String },
        gateway: { type: String },
        acquirer: { type: String },
        transaction: { type: String },
      },
      activities: [
        {
          id: { type: String },
          object: { type: String },
          created: { type: String },
          status: { type: String },
          currency: { type: String },
          amount: { type: String },
          remarks: { type: String },
        },
      ],
    }
  }, { timestamps: true }
);

module.exports = mongoose.model("orders", orderSchema);

