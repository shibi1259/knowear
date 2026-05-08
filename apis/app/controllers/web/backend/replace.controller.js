const { body, validationResult } = require("express-validator")
const service = require("../../../services/replace.service")
const helper = require('../../../../util/responseHelper')
const orderService = require("../../../services/order.service")
const mailerService = require("../../../services/mailer.service")
const productService = require("../../../services/product.service")
const prouctHeadService = require("../../../services/product.head.service")
const messages = require('../../../../config/constants').messages
const adminService = require("../../../services/auth.service")
const activity = require("../../../../util/activity.creator")
const userService = require("../../../services/customer.service")
const settingsService = require("../../../services/general.settings.service")
const templates = require("../../../../util/templates")
const mailer = require("../../../../util/sendMail")
const { BASE_URL } = require("../../../../config/constants/common")
const { months } = require("../../../../util/months")
const { v4: uuidv4 } = require('uuid');

exports.updateRequest = async (req, res) => {
    try {
        const { body } = req
        const { email } = res?.locals?.user
        const replaceDetails = await service.findOne({ reference: body?.reference })
        const settings = await settingsService.findOne({ })
        const productDetails = await productService.getProductDetails({ _id: body?.productDetails?.productId })
        const replaceResponse = await service.update({ reference: body?.reference }, body)
        if (replaceResponse instanceof Error) {
            helper.deliverResponse(res, 422, replaceResponse, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            const payload = await getOrderPaylod(replaceDetails, body)
            const orderResponse = await orderService.createOrder(payload)
            if (orderResponse instanceof Error) {
                helper.deliverResponse(res, 422, replaceResponse, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                const replaceUpdatedResponse = await service.update({ reference: body.reference }, { refundedOrder: orderResponse._id })
                if (replaceUpdatedResponse instanceof Error) {
                    helper.deliverResponse(res, 422, replaceUpdatedResponse, {
                        "error_code": messages.serverError.error_code,
                        "error_message": messages.serverError.error_message
                    });
                } else {
                    let html = ''
                    let subject = ''
                    let content = ''
                    if (body.status == 'initiated') {
                        html = templates.replaceInitiated({
                            store: settings.name, link: `${settings.domain}/contact-us`,
                            product: productDetails.name, name: replaceDetails.customer.name
                        })
                        subject = `Replace request initiated for ${productDetails.name}`
                        content = `Replace request initiated for ${productDetails.name}`
                    } else if (body.status == 'rejected') {
                        html = templates.replaceRejected({
                            store: settings.name,
                            product: productDetails.name, name: replaceDetails.customer.name
                        })
                        subject = `Replace request rejected for ${productDetails.name}`
                        content = `Replace request rejected for ${productDetails.name}`
                    }

                    const productResponse = await orderService.update({ _id: replaceDetails?.order?._id, "products.productId": productDetails?._id }, {
                        $addToSet: { "products.$.history": { status: "REPLACE INITIATED", date: new Date().toUTCString() } }
                    })

                    if (productResponse instanceof Error) {
                        helper.deliverResponse(res, 422, {}, {
                            "error_code": messages.serverError.error_code,
                            "error_message": messages.serverError.error_message
                        });
                    }else{
                        await mailer.sendMail(replaceDetails.customer.email, subject, content, html)
                        await activity.logActivity(email, `Replace request updated for order ${replaceDetails?.order?.orderNo} (${replaceDetails?.reference})`)
                        helper.deliverResponse(res, 200, replaceResponse, {
                            "error_code": messages.ORDER_REPLACE_UPDATED.error_code,
                            "error_message": messages.ORDER_REPLACE_UPDATED.error_message
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.log("Error caught in update replace request API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

const getOrderPaylod = async (replaceDetails, body) => {
    const orderDetails = await orderService.getOrderDetails({ _id: replaceDetails?.order?._id })
    const productDetails = await productService.getProductDetails({ _id: body?.productDetails?.productId })
    const parentDetails = await prouctHeadService.findOne({ _id: productDetails?.product?.id?._id })
    const priceBeforeTax = (body.productDetails.pricePerUnit * replaceDetails?.quantity) / (1 + parentDetails.tax.rate / 100);

    return payload = {
        tags: ["replaced"],
        source: "SYSTEM",
        orderNote: "",
        orderStatus: "PLACED",
        refid: await orderService.getOrderCounts({}) + 1,
        orderNo: "REP-" + uuidv4().split("-")[0].toUpperCase(),
        invoiceNo: "REP-" + uuidv4().split("-")[0].toUpperCase(),
        orderType: "replace",
        orderTime: new Date().toLocaleTimeString(),
        orderDate: new Date().toUTCString(),
        deliveryDate: "",
        paymentStatus: 'PAID',
        paymentMethod: orderDetails?.paymentMethod,
        products: [{
            quantity: replaceDetails?.quantity,
            productId: productDetails?._id,
            pricePerUnit: body?.productDetails?.pricePerUnit,
            total: (body?.productDetails?.pricePerUnit * replaceDetails?.quantity).toFixed(2),
            paymentStatus: 'PAID',
            baseTotal: (priceBeforeTax).toFixed(2),
            history: [{ status: 'PLACED', date: new Date().toUTCString() }],
            taxTotal: ((body?.productDetails?.pricePerUnit * replaceDetails?.quantity) - priceBeforeTax).toFixed(2)
        }],
        orderReference: orderDetails?._id,
        address: orderDetails?.address,
        subtotal: (priceBeforeTax).toFixed(2),
        priceBeforeTax: (priceBeforeTax).toFixed(2),
        tax: ((body?.productDetails?.pricePerUnit * replaceDetails?.quantity) - priceBeforeTax).toFixed(2),
        priceAfterTax: (body?.productDetails?.pricePerUnit * replaceDetails?.quantity).toFixed(2),
        total: (body?.productDetails?.pricePerUnit * replaceDetails?.quantity).toFixed(2)
    }
}

exports.replaceDetails = async (req, res) => {
    try {
        const { replace } = req.params
        const replaceDetails = await service.findOne({ reference: replace })
        let replacedProduct = {}
        for (let product of replaceDetails?.order?.products) {
            const productDetails = await productService.getProductDetails({ _id: product?.productId })
            productDetails?.slug == replaceDetails?.product?.slug ? replacedProduct = product : null
        }
        helper.deliverResponse(res, 200, { ...replaceDetails?._doc, productDetails: replacedProduct }, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in replace details API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.replaceRequests = async (req, res) => {
    try {
        const { page, limit, status } = req.query
        let query = {}
        status ? query['status'] = status : null
        const replaceRequests = await service.search(query, {}, { createdAt: -1 }, page, limit)
        helper.deliverResponse(res, 200, replaceRequests, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        })
    } catch (error) {
        console.log("Error caught in replace requests API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}