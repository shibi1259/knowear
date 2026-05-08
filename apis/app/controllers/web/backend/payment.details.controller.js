const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/payment.details.service");
const activity = require("../../../../util/activity.creator");
const { BASE_URL } = require("../../../../config/constants/common");
const settingsService = require("../../../services/general.settings.service");

let indexes = {
    'tap': 0,
    'paytabs': 3,
    'tabby': 4,
    'rakbank': 5
}

exports.manage = async (req, res) => {
    const { body } = req
    const paymentDetails = await service.findOne({ paymentGateway: body.paymentGateway })
    if (paymentDetails) {
        const response = await service.update({ _id: body?._id }, body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(res?.locals?.user?.email, `Payment ${body.paymentGateway} details updated`)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.PAYMENT_DETAILS_UPDATED.error_code,
                "error_message": messages.PAYMENT_DETAILS_UPDATED.error_message
            });
        }
    } else {
        const response = await service.create(body)
        if (response instanceof Error) {
            helper.deliverResponse(res, 422, response, {
                "error_code": messages.serverError.error_code,
                "error_message": messages.serverError.error_message
            });
        } else {
            activity.logActivity(res?.locals?.user?.email, `New payment ${body.paymentGateway} details added`)
            helper.deliverResponse(res, 200, response, {
                "error_code": messages.PAYMENT_DETAILS_UPDATED.error_code,
                "error_message": messages.PAYMENT_DETAILS_UPDATED.error_message
            });
        }
    }
}

exports.findOne = async (req, res) => {
    const { pgId } = req.params
    const response = await service.findOne({ paymentGateway: pgId })
    helper.deliverResponse(res, 200, response, {
        "error_code": messages.successResponse.error_code,
        "error_message": messages.successResponse.error_message
    });
}

exports.find = async (req, res) => {
    const response = await service.find({ isEnabled: true })
    helper.deliverResponse(res, 200, response, {
        "error_code": messages.successResponse.error_code,
        "error_message": messages.successResponse.error_message
    });
}

exports.paymentGateways = async (req, res) => {
    let paymentGateways = []
    const settings = await settingsService.findOne({ })
    const pgItems = await service.find({ isEnabled: true })
    for (let pgItem of pgItems) {
        paymentGateways.push({
            title: pgItem?.displayName,
            thumbnail: pgItem?.displayIcon ? `${BASE_URL}${pgItem?.displayIcon?.path}` : null,
            index: indexes[pgItem?.paymentGateway]
        })
    }
    helper.deliverResponse(res, 200, {
        paymentGateways: paymentGateways,
        isOnlinePayment: settings?.isOnlinePayment,
        isCashOnDelivery: settings?.isCashOnDelivery,
        isCardOnDelivery: settings?.isCardOnDelivery
    }, {
        "error_code": messages.successResponse.error_code,
        "error_message": messages.successResponse.error_message
    });
}