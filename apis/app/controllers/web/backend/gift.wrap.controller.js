const helper = require("../../../../util/responseHelper");
const { messages } = require("../../../../config/constants");
const service = require("../../../services/gift.wrap.service");
const activity = require("../../../../util/activity.creator");

exports.manageGiftWrap = async (req, res) => {
    try {
        const { body } = req
        const details = await service.findOne({ slug: 'gift-wrap' })
        if (details) {
            const response = await service.update({ slug: 'gift-wrap' }, body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(res?.locals?.user?.email, `New gift wrap details updated`)
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.GIFT_WRAP_UPDATED.error_code,
                    "error_message": messages.GIFT_WRAP_UPDATED.error_message
                });
            }
        } else {
            const response = await service.create(body)
            if (response instanceof Error) {
                helper.deliverResponse(res, 422, {}, {
                    "error_code": messages.serverError.error_code,
                    "error_message": messages.serverError.error_message
                });
            } else {
                activity.logActivity(res?.locals?.user?.email, `New gift wrap details created`)
                helper.deliverResponse(res, 200, response, {
                    "error_code": messages.GIFT_WRAP_CREATED.error_code,
                    "error_message": messages.GIFT_WRAP_CREATED.error_message
                });
            }
        }
    } catch (error) {
        console.log('Error caught in manage gift wrap API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}

exports.giftWrapDetails = async (req, res) => {
    try {
        const details = await service.findOne({ slug: 'gift-wrap' }, { _id: 0, __v: 0 })
        helper.deliverResponse(res, 200, details, {
            "error_code": messages.successResponse.error_code,
            "error_message": messages.successResponse.error_message
        });
    } catch (error) {
        console.log('Error caught in gift wrap details API :: ' + error)
        helper.deliverResponse(res, 422, {}, {
            "error_code": messages.serverError.error_code,
            "error_message": messages.serverError.error_message
        });
    }
}