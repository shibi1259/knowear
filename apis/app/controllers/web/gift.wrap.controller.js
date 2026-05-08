const helper = require("../../../util/appWebResponse");
const { body, validationResult } = require("express-validator");
const messages = require("../../../config/constants").messages;
const service = require("../../services/cart.service");
const productService = require("../../services/product.service");
const giftWrapService = require("../../services/gift.wrap.service");
exports.validate = (method) => {
    switch (method) {
        case "manage-gift": {
            return [
                body("cart", "Cart is required").exists(),
                body("isGift", "Gift enabled is required").exists(),
                body("product", "Product is required").exists(),
                body("giftMessage", "Gift message is required").exists(),
            ];
        }
    }
}

exports.manageGift = async (req, res) => {
    try {
        const { body } = req;
        const productDetails = await productService.getProductDetails({ slug: body.product })
        let payload = {}
        if (body?.isGiftBox) {
            payload = { isGiftBox: body.isGiftBox, giftBoxMessage: body.giftBoxMessage }
        } else {
            payload = {
                "products.$.isGift": body.isGift, // or any other value you want to set
                "products.$.giftMessage": body.giftMessage, // or any other value you want to set
            }
        }
        const response = await service.updateCart({ refid: body.cart, "products.product": productDetails?._id }, payload)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, {}, {
                error_code: messages.serverError.error_code,
                error_message: messages.serverError.error_message,
            });
        } else {
            helper.deliverResponse(res, 200, {}, {
                error_code: messages.CART_UPDATED.error_code,
                error_message: messages.CART_UPDATED.error_message,
            });
        }
    } catch (error) {
        console.log("Error caught in manage gift web api :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}

exports.giftWrapDetails = async (req, res) => {
    try {
        const details = await giftWrapService.findOne({ slug: 'gift-wrap' }, { _id: 0, __v: 0 })
        helper.deliverResponse(res, 200, details, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log("Error caught in gift wrap details web api :: " + error);
        helper.deliverResponse(res, 422, {}, {
            error_code: messages.serverError.error_code,
            error_message: messages.serverError.error_message,
        });
    }
}