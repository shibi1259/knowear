const helper = require('../../../util/responseHelper')
const messages = require('../../../config/constants').messages
const service = require('../../services/replace.service')
const productService = require('../../services/product.service')
const orderService = require('../../services/order.service')
const userService = require('../../services/customer.service')
const { body, validationResult } = require("express-validator");
const templates = require("../../../util/templates")
const mailer = require("../../../util/sendMail")

function generateReplaceRequestID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

exports.validate = (method) => {
    switch (method) {
        case "add": {
            return [
                body("product", "Product is required").exists(),
                body("order", "Order is required").exists(),
                body("quantity", "Quantity is required").exists(),
                body("reason", "Reason is required").exists(),
            ];
        }
        case "update": {
            return [
                body("refid", "Refid is required").exists(),
            ];
        }
    }
};

exports.initiateReplace = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            helper.deliverResponse(res, 422, errors, {
                "error_code": messages.VALIDATION_ERROR.error_code,
                "error_message": messages.VALIDATION_ERROR.error_message
            });
            return;
        }

        const { body } = req
        const { userid } = res?.locals?.user
        const userDetails = await userService.getCustomerDetails({ userid: userid })
        const orderDetails = await orderService.getOrderDetails({ orderNo: body?.order })
        const productDetails = await productService.getSingleProduct({ slug: body?.product })
        body.refid = await service.count({}) + 1
        body.order = orderDetails?._id
        body.product = productDetails?._id
        body.customer = userDetails?._id
        const generateRef = async () => {
            const reference = generateReplaceRequestID()
            const returnDetails = await service.count({ reference: reference })
            if (returnDetails) {
                generateRef()
            } else {
                body.reference = reference
            }
        }
        await generateRef()
        const response = await service.create(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            const productResponse = await orderService.update({ _id: orderDetails?._id, "products.productId": productDetails?._id }, {
                $addToSet: { "products.$.history": { status: "REPLACE REQUESTED", date: new Date().toUTCString() } }
            })

            if (productResponse instanceof Error) {
                helper.deliverResponse(res, 422, productResponse, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                const html = await templates.replaceConfirmation({
                    name: userDetails?.name, order: orderDetails?.orderNo,
                    product: productDetails?.name, reference: body?.reference,
                    reason: body?.reason,
                })

                await mailer.sendMail(
                    userDetails?.email, "Replace Request Initiated For " + productDetails?.name,
                    "Replace Request Initiated For " + productDetails?.name, html,
                )

                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.ORDER_REPLACE_INITIATED.error_code,
                    "error_message": messages.ORDER_REPLACE_INITIATED.error_message
                });
            }
        }
    } catch (error) {
        console.log("Error caught in initiate replace API :: " + error);
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}