const axios = require('axios');
const paymentService = require("../../app/services/payment.details.service");

exports.createTabbyTxn = async (data, products, orderHistory, customerDetails, guestDetails) => {
    // const paymentDetails = await paymentService.findOne({ paymentGateway: 'tabby' })
    const paymentDetails = {}
    const paymentPayload = {
        payment: {
            amount: data?.total,
            currency: 'AED',
            description: 'Payment for order ' + data?.orderNo,
            buyer: {
                name: `${customerDetails?.name || guestDetails?.name}`,
                email: `${customerDetails?.email || guestDetails?.email}`,
                phone: `${customerDetails?.countryCode || guestDetails?.countryCode}${customerDetails?.mobile || guestDetails?.mobile}`,
            },
            shipping_address: {
                city: data?.address?.city,
                address: data?.address?.firstlane,
                zip: data?.address?.pincode,
            },
            order: {
                tax_amount: data?.tax,
                shipping_amount: data?.shippingCost ? data?.shippingCost : '0',
                discount_amount: data?.discount,
                reference_id: data?.orderNo.split('#')[1],
                updated_at: new Date().toISOString(),
                items: products
            },
            buyer_history: {
                registered_since: customerDetails?.createdAt ? new Date(customerDetails?.createdAt).toISOString() : new Date(guestDetails?.createdAt).toISOString(),
                loyalty_level: 0
            },
            order_history: orderHistory
        },
        merchant_urls: {
            success: "https://mattressland.storedada.net/order-placed?orderId=" + data?.orderNo.split('#')[1],
            cancel: "https://mattressland.storedada.net/order-cancelled?orderId=" + data?.orderNo.split('#')[1],
            failure: "https://mattressland.storedada.net/order-failed?orderId=" + data?.orderNo.split('#')[1],
        },
        lang: "en",
        merchant_code: "mattresslanduae",
        token: null
    }

    const options = {
        method: 'POST',
        url: 'https://api.tabby.ai/api/v2/checkout',
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${paymentDetails?.secretKey || "sk_34e53ce5-ad78-4eb5-b321-7f508443fed2"}`
        },
        data: paymentPayload
    }
    await axios.request(options).then((_paymentResult) => {
        console.log(_paymentResult);
        return _paymentResult;
    }).catch((error) => {
        console.log(error?.response?.data);
        return error;
    });
}
